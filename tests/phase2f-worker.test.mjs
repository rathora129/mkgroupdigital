import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import {
  sql,
  query,
  closeDatabase,
  assertDisposableTestUrl,
} from './support/db.mjs';
import {
  getErrorDiagnostics,
  redactDiagnosticMessage,
} from '../scripts/ai-worker.mjs';

// Phase 2F-E: worker lifecycle, retry, cancellation and honest status. The
// queue job is injected and the provider call is a deterministic stub, so
// pg-boss never starts and no real provider is contacted.
const TEST_DATABASE_URL = process.env.PHASE2A_TEST_DATABASE_URL || '';
const skip = TEST_DATABASE_URL
  ? false
  : 'set PHASE2A_TEST_DATABASE_URL to a disposable, migrated database';

let runtime = null;
let worker = null;
let ProviderError = null;
let checkAiWorker = null;
let registry = null;

test('worker diagnostics redact connection URLs and sensitive query parameters', () => {
  const cases = [
    'postgresql://dbuser:db-password@db.example/app?sslmode=require',
    'mysql://mysql-user:mysql-password@mysql.example/app',
    'mongodb+srv://mongo-user:mongo-password@cluster.example/app',
    'redis://default:redis-password@cache.example:6379/0',
    'https://api-user:api-password@service.example/path',
    'https://service.example/path?x-api-key=query-secret&mode=read',
  ];

  for (const diagnostic of cases) {
    const redacted = redactDiagnosticMessage(diagnostic);
    assert.equal(redacted.includes('://'), false);
    assert.doesNotMatch(
      redacted,
      /db-password|mysql-password|mongo-password|redis-password|query-secret/,
    );
  }

  assert.equal(
    redactDiagnosticMessage('Failed query\nparams: ["query-param-secret"]'),
    'Failed query\n[redacted query parameters]',
  );
});

test('worker diagnostics redact quoted credentials with spaces and bearer tokens', () => {
  const diagnostic = redactDiagnosticMessage(
    'password: "a quoted password with spaces"; Bearer bearer-secret-value',
  );
  assert.doesNotMatch(diagnostic, /quoted password|with spaces|bearer-secret-value/);
  assert.match(diagnostic, /password: \[redacted\]/);
  assert.match(diagnostic, /Bearer \[redacted\]/);
});

test('worker diagnostics redact known sensitive environment values', () => {
  const envName = 'AI_WORKER_DIAGNOSTIC_TEST_API_KEY';
  const previous = process.env[envName];
  const secret = 'diagnostic-env-secret-value';
  process.env[envName] = secret;
  try {
    assert.equal(
      redactDiagnosticMessage(`provider returned ${secret}`),
      'provider returned [redacted]',
    );
  } finally {
    if (previous === undefined) delete process.env[envName];
    else process.env[envName] = previous;
  }
});

test('worker diagnostics preserve ordinary messages and PostgreSQL error fields', () => {
  const ordinaryMessage = 'column "agent_runs.status" does not exist';
  assert.equal(redactDiagnosticMessage(ordinaryMessage), ordinaryMessage);

  const cause = Object.assign(new Error('column does not exist'), {
    code: '42703',
    schema: 'public',
    table: 'agent_runs',
    column: 'context_sources',
    constraint: 'agent_runs_status_check',
  });
  const diagnostics = getErrorDiagnostics(
    new Error('Failed query: select ...', { cause }),
  );
  assert.equal(diagnostics.causes[0].code, '42703');
  assert.equal(diagnostics.causes[0].schema, 'public');
  assert.equal(diagnostics.causes[0].table, 'agent_runs');
  assert.equal(diagnostics.causes[0].column, 'context_sources');
  assert.equal(diagnostics.causes[0].constraint, 'agent_runs_status_check');

  const chainRoot = new Error('root');
  let current = chainRoot;
  for (let index = 0; index < 7; index += 1) {
    current.cause = new Error(`cause ${index}`);
    current = current.cause;
  }
  assert.equal(getErrorDiagnostics(chainRoot).causes.length, 5);

  const cycle = new Error('cycle');
  cycle.cause = cycle;
  assert.equal(getErrorDiagnostics(cycle).causes.length, 0);
});

if (TEST_DATABASE_URL) {
  assertDisposableTestUrl(TEST_DATABASE_URL);
  process.env.DATABASE_URL = TEST_DATABASE_URL;
  process.env.OPENAI_API_KEY = 'phase2f-worker-test-key';
  runtime = await import('@/lib/ai/runtime');
  worker = await import('@/lib/ai/worker');
  ({ ProviderError } = await import('@/lib/ai/errors'));
  ({ checkAiWorker } = await import('@/lib/ai/worker-health'));
  registry = await import('@/lib/ai/registry');
}

after(async () => {
  delete process.env.OPENAI_API_KEY;
  delete process.env.AI_WORKER_HEALTH_URL;
  await closeDatabase();
});

async function createWorkspace() {
  const suffix = randomUUID();
  const [workspace] = await query(sql`
    insert into workspaces (name, slug)
    values ('Phase 2F worker test', ${`p2f-w-${suffix}`})
    returning id
  `);
  const email = `p2f-worker-${suffix}@example.test`;
  const [user] = await query(sql`insert into users (email) values (${email}) returning id`);
  await query(sql`
    insert into workspace_memberships (workspace_id, user_id, role)
    values (${workspace.id}, ${user.id}, 'owner')
  `);
  return { workspaceId: workspace.id, userId: user.id, email };
}

async function cleanup(fixture) {
  await query(sql`delete from audit_logs where workspace_id = ${fixture.workspaceId}`);
  await query(sql`delete from workspaces where id = ${fixture.workspaceId}`);
  await query(sql`delete from users where id = ${fixture.userId}`);
}

function agentData(overrides = {}) {
  return {
    name: `Worker Agent ${randomUUID().slice(0, 8)}`,
    type: 'lead_research',
    instructions: 'Summarise only what the supplied details support.',
    provider: 'openai',
    model: 'gpt-4o-mini',
    enabled: true,
    toolPermissions: ['read_workspace'],
    allowedWorkflows: ['research'],
    approvalRequired: false,
    ...overrides,
  };
}

async function newAgent(fixture) {
  return runtime.createAgent({
    workspaceId: fixture.workspaceId,
    userId: fixture.userId,
    data: agentData(),
  });
}

async function queueRun(fixture, agent, input = 'Do the work') {
  const { run } = await runtime.createAgentRun({
    workspaceId: fixture.workspaceId,
    agentId: agent.id,
    userId: fixture.userId,
    input,
    enqueue: async (runId) => `job-${runId.slice(0, 8)}`,
  });
  return run;
}

function stub(text = 'Done.', usage = { promptTokens: 10, completionTokens: 5 }) {
  return async () => ({ text, toolCalls: [], usage });
}

test('the worker lifecycle reports success through processAgentJob', { skip }, async () => {
  const fixture = await createWorkspace();
  try {
    const agent = await newAgent(fixture);
    const run = await queueRun(fixture, agent);

    const result = await worker.processAgentJob(
      { id: 'job-1', data: { runId: run.id } },
      { generate: stub('Worker output.') },
    );

    assert.equal(result.status, 'completed');
    const detail = await runtime.getRunDetail(fixture.workspaceId, run.id);
    assert.equal(detail.run.status, 'completed');
    assert.equal(detail.run.attempts, 1);
    assert.equal(detail.run.output.text, 'Worker output.');
  } finally {
    await cleanup(fixture);
  }
});

test('missing run ids are skipped without touching the provider', { skip }, async () => {
  let called = false;
  const result = await worker.processAgentJob(
    { id: 'job-empty', data: {} },
    {
      generate: async () => {
        called = true;
        return { text: 'x', usage: {} };
      },
    },
  );
  assert.equal(result.status, 'skipped');
  assert.equal(result.reason, 'missing-run-id');
  assert.equal(called, false);
});

test(
  'a retryable failure is handed back to the queue and a later attempt succeeds',
  { skip },
  async () => {
    const fixture = await createWorkspace();
    try {
      const agent = await newAgent(fixture);
      const run = await queueRun(fixture, agent);

      await assert.rejects(
        () =>
          worker.processAgentJob(
            { id: 'job-retry', data: { runId: run.id } },
            {
              generate: async () => {
                throw new ProviderError('rate_limited', 'slow down', { retryable: true });
              },
            },
          ),
        /slow down/,
        'a retryable result must throw so pg-boss reschedules the job',
      );

      let stored = await runtime.getRun(fixture.workspaceId, run.id);
      assert.equal(stored.run.status, 'queued');
      assert.equal(stored.run.attempts, 1);

      const second = await runtime.executeAgentRun(run.id, { generate: stub('Recovered.') });
      assert.equal(second.status, 'completed');

      stored = await runtime.getRun(fixture.workspaceId, run.id);
      assert.equal(stored.run.status, 'completed');
      assert.equal(stored.run.attempts, 2);
      assert.equal(stored.run.output.text, 'Recovered.');
    } finally {
      await cleanup(fixture);
    }
  },
);

test('provider failures never mark a run completed', { skip }, async () => {
  const fixture = await createWorkspace();
  try {
    const agent = await newAgent(fixture);

    const bad = await queueRun(fixture, agent, 'Bad request path');
    const failed = await runtime.executeAgentRun(bad.id, {
      maxAttempts: 3,
      generate: async () => {
        throw new ProviderError('invalid_request', 'malformed request');
      },
    });
    assert.equal(failed.status, 'failed');

    let stored = await runtime.getRun(fixture.workspaceId, bad.id);
    assert.equal(stored.run.status, 'failed');
    assert.equal(stored.run.output, null, 'a failed run must not store output');
    assert.equal(stored.run.errorMessage, 'malformed request');

    const crashed = await queueRun(fixture, agent, 'Unexpected crash');
    const crashResult = await runtime.executeAgentRun(crashed.id, {
      maxAttempts: 3,
      generate: async () => {
        throw new Error('socket hang up');
      },
    });
    assert.equal(crashResult.status, 'failed');

    stored = await runtime.getRun(fixture.workspaceId, crashed.id);
    assert.equal(stored.run.status, 'failed');
    assert.equal(stored.run.output, null);
    assert.match(stored.run.errorMessage, /socket hang up/);
  } finally {
    await cleanup(fixture);
  }
});

test('a run cancelled mid-flight stops as cancelled, not completed', { skip }, async () => {
  const fixture = await createWorkspace();
  try {
    const agent = await newAgent(fixture);
    const run = await queueRun(fixture, agent);

    const result = await runtime.executeAgentRun(run.id, {
      generate: async () => {
        // The run is already claimed as "running"; the reviewer cancels while
        // the provider would still be answering.
        const cancelled = await runtime.cancelAgentRun({
          workspaceId: fixture.workspaceId,
          runId: run.id,
          userId: fixture.userId,
        });
        assert.equal(cancelled.deferred, true);
        return { text: 'This output must be discarded.', usage: {} };
      },
    });

    assert.equal(result.status, 'cancelled');
    const detail = await runtime.getRunDetail(fixture.workspaceId, run.id);
    assert.equal(detail.run.status, 'cancelled');
    assert.equal(detail.run.output, null, 'cancelled output is never stored');
    assert.ok(detail.logs.some((log) => /Cancelled while the provider/.test(log.message)));
  } finally {
    await cleanup(fixture);
  }
});

test('an unavailable queue fails the run honestly and audits the failure', { skip }, async () => {
  const fixture = await createWorkspace();
  try {
    const agent = await newAgent(fixture);
    const { run } = await runtime.createAgentRun({
      workspaceId: fixture.workspaceId,
      agentId: agent.id,
      userId: fixture.userId,
      input: 'Queue is down',
      enqueue: async () => {
        throw new Error('connect ECONNREFUSED');
      },
    });

    assert.equal(run.status, 'failed');
    assert.match(run.errorMessage, /queue is unavailable|worker/i);

    const audit = await query(sql`
      select action, success from audit_logs
      where workspace_id = ${fixture.workspaceId} and action = 'agent_run.failed'
    `);
    assert.equal(audit.length, 1);
    assert.equal(audit[0].success, false);
  } finally {
    await cleanup(fixture);
  }
});

test('worker health is reported accurately for running and missing workers', { skip }, async () => {
  const server = http.createServer((request, response) => {
    if (request.url !== '/health') {
      response.writeHead(404).end('{}');
      return;
    }
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(
      JSON.stringify({
        ok: true,
        startedAt: '2026-01-01T00:00:00.000Z',
        processed: 7,
        failed: 1,
      }),
    );
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  try {
    process.env.AI_WORKER_HEALTH_URL = `http://127.0.0.1:${port}/health`;
    const running = await checkAiWorker();
    assert.equal(running.status, 'running');
    assert.equal(running.processed, 7);
    assert.equal(running.failed, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  // Nothing is listening on that port now, so status must degrade honestly.
  const missing = await checkAiWorker();
  assert.equal(missing.status, 'not_running');
});

test('provider configuration is reported without exposing credentials', { skip }, async () => {
  const sentinel = `phase2f-secret-${randomUUID()}`;
  const saved = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = sentinel;
  try {
    assert.ok(registry.configuredProviderKeys().includes('openai'));

    const metadata = registry.listProviderMetadata();
    const openai = metadata.find((entry) => entry.key === 'openai');
    assert.equal(openai.configured, true);
    assert.equal(openai.envKeys, undefined, 'env var names are not sent to clients');
    assert.equal(JSON.stringify(metadata).includes(sentinel), false, 'the key never leaves the server');
  } finally {
    if (saved === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = saved;
  }
});
