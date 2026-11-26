// Local AI worker: consumes agent runs from pg-boss in the existing
// PostgreSQL database. Run it in a separate terminal:
//
//   npm run ai:worker
//
// The web app never performs provider calls inside request handlers.
import crypto from 'node:crypto';
import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { isDatabaseConfigured, closeDb } from '@/db/client';
import {
  AI_QUEUE_NAME,
  DISCOVERY_RUN_QUEUE_NAME,
  DISCOVERY_SCAN_QUEUE_NAME,
  EXECUTION_QUEUE_NAME,
  INTEGRATION_QUEUE_NAME,
  REMINDER_SCAN_QUEUE_NAME,
  RESEARCH_QUEUE_NAME,
  WEBSITE_AUDIT_QUEUE_NAME,
  WORKFLOW_QUEUE_NAME,
  ensureDiscoveryScanSchedule,
  ensureReminderScanSchedule,
  getBoss,
  getQueueCounts,
  stopQueue,
} from '@/lib/ai/queue';
import {
  processAgentJob,
  processDiscoveryRunJob,
  processDiscoveryScanJob,
  processReminderScanJob,
  processResearchJob,
  processWebsiteAuditJob,
} from '@/lib/ai/worker';
import {
  processExecutionRequestJob,
  processWebhookJob,
  processWorkflowRunJob,
} from '@/lib/integrations/worker';

const PORT = Number(process.env.PORT || process.env.AI_WORKER_HEALTH_PORT || 4319);
const HOST =
  process.env.AI_WORKER_HEALTH_HOST ||
  (process.env.PORT ? '0.0.0.0' : '127.0.0.1');
const HEALTH_SECRET = (process.env.AI_WORKER_HEALTH_SECRET || '').trim();
const startedAt = new Date().toISOString();
const stats = {
  processed: 0,
  failed: 0,
  lastJobAt: null,
  lastError: null,
};

let healthServer = null;
let shuttingDown = false;

function isAuthorizedHealthRequest(request) {
  if (!HEALTH_SECRET) return true;
  const authHeader = String(request.headers?.authorization || '');
  const expected = `Bearer ${HEALTH_SECRET}`;
  const actualBuf = Buffer.from(authHeader, 'utf8');
  const expectedBuf = Buffer.from(expected, 'utf8');
  if (actualBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(actualBuf, expectedBuf);
}

function log(...args) {
  console.log(`[ai-worker ${new Date().toISOString()}]`, ...args);
}

const SENSITIVE_NAME =
  /(?:password|passwd|pass|pwd|secret|token|apikey|authorization|auth|credential|privatekey|accesskey|clientsecret|cookie|session|signature|sig|key|username|user|login)$/i;
const SENSITIVE_ASSIGNMENT =
  /(^|[^\w-])(["']?)((?:[a-z0-9]+[_-])*(?:password|passwd|pass|pwd|secret|token|api[_-]?key|authorization|auth|credentials?|private[_-]?key|access[_-]?key|client[_-]?secret|cookie|session|signature|sig|key|username|user|login))\2(\s*[:=]\s*)("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|[^\s,;&]+)/gi;
const CONNECTION_SCHEME =
  /^(?:postgres(?:ql)?|mysql|mariadb|mongodb(?:\+srv)?|redis|rediss):$/i;

function hasSensitiveQueryParameter(url) {
  for (const key of url.searchParams.keys()) {
    if (SENSITIVE_NAME.test(key.replace(/[^a-z0-9]/gi, ''))) return true;
  }
  return false;
}

function redactUrl(candidate) {
  try {
    const url = new URL(candidate);
    if (
      CONNECTION_SCHEME.test(url.protocol) ||
      url.username ||
      url.password ||
      hasSensitiveQueryParameter(url)
    ) {
      return '[redacted URL]';
    }
  } catch {
    const scheme = `${candidate.slice(0, candidate.indexOf('://'))}:`;
    const authority = candidate.slice(candidate.indexOf('://') + 3).split(/[/?#]/, 1)[0];
    const hasSensitiveParameter = [...candidate.matchAll(/[?&]([^=&#]+)=/g)].some(
      ([, key]) => {
        try {
          return SENSITIVE_NAME.test(decodeURIComponent(key).replace(/[^a-z0-9]/gi, ''));
        } catch {
          return SENSITIVE_NAME.test(key.replace(/[^a-z0-9]/gi, ''));
        }
      },
    );
    if (
      CONNECTION_SCHEME.test(scheme) ||
      authority.includes('@') ||
      hasSensitiveParameter
    ) {
      return '[redacted URL]';
    }
  }

  return candidate;
}

export function redactDiagnosticMessage(value) {
  let message = String(value ?? 'unknown error')
    .replace(/\b[a-z][a-z\d+.-]*:\/\/[^\s"'<>]+/gi, redactUrl)
    .replace(/\bBearer\s+[^\s,;&]+/gi, 'Bearer [redacted]')
    .replace(/\b(?:params|parameters)\s*:\s*[\s\S]*$/i, '[redacted query parameters]')
    .replace(
      SENSITIVE_ASSIGNMENT,
      (_match, boundary, quote, name, separator) =>
        `${boundary}${quote}${name}${quote}${separator}[redacted]`,
    );

  for (const [key, secret] of Object.entries(process.env)) {
    if (
      /(?:DATABASE|CONNECTION|POSTGRES|MYSQL|MONGO|REDIS).*(?:URL|URI)|(?:PASSWORD|PASS|PASSWD|PWD|SECRET|TOKEN|JWT|API[_-]?KEY|CREDENTIAL|PRIVATE[_-]?KEY|ACCESS[_-]?KEY|AUTHORIZATION|COOKIE|SESSION|USERNAME|USER|LOGIN)/i.test(key) &&
      typeof secret === 'string' &&
      secret.length > 0
    ) {
      message = message.split(secret).join('[redacted]');
      const encodedSecret = encodeURIComponent(secret);
      if (encodedSecret !== secret) {
        message = message.split(encodedSecret).join('[redacted]');
      }
    }
  }

  return message;
}

function errorFields(error) {
  const fields = {};
  if (typeof error?.name === 'string') fields.name = redactDiagnosticMessage(error.name);
  fields.message = redactDiagnosticMessage(error?.message ?? error);

  for (const key of ['code', 'schema', 'table', 'column', 'constraint']) {
    if (typeof error?.[key] === 'string') {
      fields[key] = redactDiagnosticMessage(error[key]);
    }
  }

  return fields;
}

export function getErrorDiagnostics(error) {
  const causes = [];
  const seen = new Set([error]);
  let cause = error?.cause;

  while (
    cause !== null &&
    cause !== undefined &&
    causes.length < 5 &&
    !seen.has(cause)
  ) {
    seen.add(cause);
    causes.push(errorFields(cause));
    cause = typeof cause === 'object' ? cause.cause : undefined;
  }

  return { outer: errorFields(error), causes };
}

async function startWorker() {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not configured');
  }

  const boss = await getBoss({ worker: true });
  log(`connected; consuming queue "${AI_QUEUE_NAME}"`);

  await boss.work(AI_QUEUE_NAME, { batchSize: 1 }, async (jobs) => {
    const results = [];

    for (const job of jobs) {
      stats.lastJobAt = new Date().toISOString();
      try {
        const result = await processAgentJob(job);
        if (result.status === 'completed') stats.processed += 1;
        if (result.status === 'failed') stats.failed += 1;
        log(`job ${job.id}: ${result.status}${result.reason ? ` (${result.reason})` : ''}`);
        results.push(result);
      } catch (error) {
        stats.failed += 1;
        const diagnostics = getErrorDiagnostics(error);
        stats.lastError = diagnostics.outer.message;
        log(`job ${job.id}: retryable failure — ${JSON.stringify(diagnostics)}`);
        throw error;
      }
    }

    return results;
  });

  log('worker registered');

  await boss.work(RESEARCH_QUEUE_NAME, { batchSize: 1 }, async (jobs) => {
    const results = [];

    for (const job of jobs) {
      stats.lastJobAt = new Date().toISOString();
      try {
        const result = await processResearchJob(job);
        if (result.status === 'started' || result.status === 'completed') {
          stats.processed += 1;
        }
        if (result.status === 'failed') stats.failed += 1;
        log(
          `research job ${job.id}: ${result.status}${result.reason ? ` (${result.reason})` : ''}`,
        );
        results.push(result);
      } catch (error) {
        stats.failed += 1;
        stats.lastError = error?.message || 'unknown error';
        log(`research job ${job.id}: retryable failure — ${stats.lastError}`);
        throw error;
      }
    }

    return results;
  });

  log(`research queue "${RESEARCH_QUEUE_NAME}" registered`);

  await boss.work(WEBSITE_AUDIT_QUEUE_NAME, { batchSize: 1 }, async (jobs) => {
    const results = [];

    for (const job of jobs) {
      stats.lastJobAt = new Date().toISOString();
      try {
        const result = await processWebsiteAuditJob(job);
        if (result.status === 'completed') stats.processed += 1;
        if (result.status === 'failed') stats.failed += 1;
        log(
          `audit job ${job.id}: ${result.status}${result.reason ? ` (${result.reason})` : ''}`,
        );
        results.push(result);
      } catch (error) {
        stats.failed += 1;
        stats.lastError = error?.message || 'unknown error';
        log(`audit job ${job.id}: retryable failure — ${stats.lastError}`);
        throw error;
      }
    }

    return results;
  });

  log(`website audit queue "${WEBSITE_AUDIT_QUEUE_NAME}" registered`);

  await boss.work(INTEGRATION_QUEUE_NAME, { batchSize: 1 }, async (jobs) => {
    const results = [];
    for (const job of jobs) {
      stats.lastJobAt = new Date().toISOString();
      try {
        const result = await processWebhookJob(job);
        if (result.status === 'processed') stats.processed += 1;
        if (result.status === 'failed') stats.failed += 1;
        log(`webhook job ${job.id}: ${result.status}${result.reason ? ` (${result.reason})` : ''}`);
        results.push(result);
      } catch (error) {
        stats.failed += 1;
        stats.lastError = error?.message || 'unknown error';
        log(`webhook job ${job.id}: retryable failure — ${stats.lastError}`);
        throw error;
      }
    }
    return results;
  });
  log(`integration queue "${INTEGRATION_QUEUE_NAME}" registered`);

  await boss.work(EXECUTION_QUEUE_NAME, { batchSize: 1 }, async (jobs) => {
    const results = [];
    for (const job of jobs) {
      stats.lastJobAt = new Date().toISOString();
      try {
        const result = await processExecutionRequestJob(job);
        if (result.status === 'completed') stats.processed += 1;
        if (result.status === 'failed') stats.failed += 1;
        log(`execution job ${job.id}: ${result.status}${result.reason ? ` (${result.reason})` : ''}`);
        results.push(result);
      } catch (error) {
        stats.failed += 1;
        stats.lastError = error?.message || 'unknown error';
        log(`execution job ${job.id}: retryable failure — ${stats.lastError}`);
        throw error;
      }
    }
    return results;
  });
  log(`execution queue "${EXECUTION_QUEUE_NAME}" registered`);

  await boss.work(WORKFLOW_QUEUE_NAME, { batchSize: 1 }, async (jobs) => {
    const results = [];
    for (const job of jobs) {
      stats.lastJobAt = new Date().toISOString();
      try {
        const result = await processWorkflowRunJob(job);
        if (result.status === 'completed') stats.processed += 1;
        if (result.status === 'failed') stats.failed += 1;
        log(`workflow job ${job.id}: ${result.status}${result.reason ? ` (${result.reason})` : ''}`);
        results.push(result);
      } catch (error) {
        stats.failed += 1;
        stats.lastError = error?.message || 'unknown error';
        log(`workflow job ${job.id}: retryable failure — ${stats.lastError}`);
        throw error;
      }
    }
    return results;
  });
  log(`workflow queue "${WORKFLOW_QUEUE_NAME}" registered`);

  await boss.work(DISCOVERY_RUN_QUEUE_NAME, { batchSize: 1 }, async (jobs) => {
    const results = [];
    for (const job of jobs) {
      stats.lastJobAt = new Date().toISOString();
      try {
        const result = await processDiscoveryRunJob(job);
        if (result.status === 'completed') stats.processed += 1;
        if (result.status === 'failed') stats.failed += 1;
        log(
          `discovery run ${job.id}: ${result.status}${result.reason ? ` (${result.reason})` : ''}`,
        );
        results.push(result);
      } catch (error) {
        stats.failed += 1;
        stats.lastError = error?.message || 'unknown error';
        log(`discovery run ${job.id}: retryable failure — ${stats.lastError}`);
        throw error;
      }
    }
    return results;
  });
  log(`discovery run queue "${DISCOVERY_RUN_QUEUE_NAME}" registered`);

  await boss.work(DISCOVERY_SCAN_QUEUE_NAME, { batchSize: 1 }, async (jobs) => {
    const results = [];
    for (const job of jobs) {
      stats.lastJobAt = new Date().toISOString();
      try {
        const result = await processDiscoveryScanJob(job);
        log(
          `discovery scan: ${result.due} due, ${result.enqueued} enqueued, ${result.failed} failed`,
        );
        results.push(result);
      } catch (error) {
        stats.lastError = error?.message || 'unknown error';
        log(`discovery scan failed — ${stats.lastError}`);
        throw error;
      }
    }
    return results;
  });
  log(`discovery scan queue "${DISCOVERY_SCAN_QUEUE_NAME}" registered`);

  await boss.work(REMINDER_SCAN_QUEUE_NAME, { batchSize: 1 }, async (jobs) => {
    const results = [];
    for (const job of jobs) {
      stats.lastJobAt = new Date().toISOString();
      try {
        const result = await processReminderScanJob(job);
        log(
          `follow-up scan: ${result.scanned} scanned, ${result.reminders} reminders, ${result.escalated} escalated`,
        );
        results.push(result);
      } catch (error) {
        stats.lastError = error?.message || 'unknown error';
        log(`follow-up scan failed — ${stats.lastError}`);
        throw error;
      }
    }
    return results;
  });
  log(`follow-up scan queue "${REMINDER_SCAN_QUEUE_NAME}" registered`);

  try {
    await ensureDiscoveryScanSchedule();
    log('discovery scan scheduled every 10 minutes');
  } catch (error) {
    log(`discovery scan schedule could not be created: ${error?.message || error}`);
  }

  try {
    await ensureReminderScanSchedule();
    log('follow-up reminder scan scheduled every 15 minutes');
  } catch (error) {
    log(`follow-up scan schedule could not be created: ${error?.message || error}`);
  }

  healthServer = http.createServer(async (request, response) => {
    const pathname = String(request.url || '/').split('?')[0];

    if (pathname === '/healthz') {
      response.writeHead(shuttingDown ? 503 : 200, {
        'content-type': 'application/json',
        'cache-control': 'no-store',
      });
      response.end(JSON.stringify({ ok: !shuttingDown }));
      return;
    }

    if (pathname !== '/health') {
      response.writeHead(404, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ ok: false, error: 'not found' }));
      return;
    }

    if (!isAuthorizedHealthRequest(request)) {
      response.writeHead(401, {
        'content-type': 'application/json',
        'cache-control': 'no-store',
      });
      response.end(JSON.stringify({ ok: false, error: 'unauthorized' }));
      return;
    }

    let queue = null;
    try {
      queue = await getQueueCounts();
    } catch {
      queue = null;
    }

    response.writeHead(shuttingDown ? 503 : 200, {
      'content-type': 'application/json',
      'cache-control': 'no-store',
    });
    response.end(
      JSON.stringify({
        ok: !shuttingDown,
        startedAt,
        processed: stats.processed,
        failed: stats.failed,
        lastJobAt: stats.lastJobAt,
        hasError: Boolean(stats.lastError),
        queue,
      }),
    );
  });

  healthServer.listen(PORT, HOST, () => {
    log(`health endpoint on http://${HOST}:${PORT}/health`);
  });
}

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  log(`received ${signal}; finishing current job`);

  if (healthServer) {
    await new Promise((resolve) => healthServer.close(resolve));
    healthServer = null;
  }

  await stopQueue({ graceful: true });
  await closeDb();
  process.exit(0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  startWorker().catch(async (error) => {
    console.error(`[ai-worker] failed to start: ${error?.message || error}`);
    await stopQueue({ graceful: false }).catch(() => {});
    await closeDb().catch(() => {});
    process.exit(1);
  });
}
