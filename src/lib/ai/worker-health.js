// The worker publishes a small loopback health endpoint. The web app checks it
// with a short timeout; a missing worker is reported as "not_running" instead
// of blocking the health response.
const DEFAULT_URL = 'http://127.0.0.1:4319/health';

export async function checkAiWorker() {
  const url = process.env.AI_WORKER_HEALTH_URL || DEFAULT_URL;
  const timeout = Number(process.env.AI_WORKER_HEALTH_TIMEOUT_MS || 500);

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(Math.max(100, timeout)),
      cache: 'no-store',
    });
    if (!response.ok) return { status: 'unhealthy' };

    const data = await response.json().catch(() => null);
    if (!data?.ok) return { status: 'unhealthy' };

    return {
      status: 'running',
      startedAt: data.startedAt || null,
      processed: Number(data.processed || 0),
      failed: Number(data.failed || 0),
    };
  } catch {
    return { status: 'not_running' };
  }
}
