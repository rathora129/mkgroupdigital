import { NextResponse } from 'next/server';
import { ApiError } from '@/lib/api-error';

export { ApiError, AccessError } from '@/lib/api-error';

const MAX_BODY_BYTES = 32 * 1024;

export function jsonOk(data, status = 200) {
  return NextResponse.json(
    { ok: true, data },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}

export function jsonError(status, code, message, details) {
  return NextResponse.json(
    {
      ok: false,
      error: { code, message, ...(details ? { details } : {}) },
    },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}

export function errorResponse(error) {
  if (error instanceof ApiError) {
    return jsonError(error.status, error.code, error.message, error.details);
  }

  console.error(`[workforce-api] ${error?.name || 'Error'}`);
  return jsonError(
    500,
    'INTERNAL',
    'Something went wrong. Please try again.',
  );
}

export async function readJsonBody(request) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) {
    throw new ApiError(413, 'BODY_TOO_LARGE', 'That request is too large.');
  }

  try {
    return await request.json();
  } catch {
    throw new ApiError(400, 'INVALID_JSON', 'The request body could not be read.');
  }
}

// Browsers send Origin on state-changing requests. SameSite=Lax cookies also
// block cross-site POSTs; this is the second layer.
export function assertSameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) {
    throw new ApiError(403, 'INVALID_ORIGIN', 'This request was rejected.');
  }

  let originHost;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new ApiError(403, 'INVALID_ORIGIN', 'This request was rejected.');
  }

  const forwardedHost = request.headers.get('x-forwarded-host');
  const host = forwardedHost?.split(',')[0]?.trim() || request.headers.get('host');

  if (!host || originHost !== host) {
    throw new ApiError(403, 'INVALID_ORIGIN', 'This request was rejected.');
  }
}

export async function validateBody(schema, payload) {
  try {
    return await schema.validate(payload, {
      abortEarly: false,
      stripUnknown: true,
    });
  } catch (error) {
    const details = {};
    for (const issue of error.inner || []) {
      if (issue.path && !details[issue.path]) details[issue.path] = issue.message;
    }
    throw new ApiError(
      422,
      'VALIDATION_FAILED',
      'Please check the highlighted fields and try again.',
      details,
    );
  }
}
