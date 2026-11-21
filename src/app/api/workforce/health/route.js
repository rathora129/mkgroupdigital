import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'mk-ai-workforce',
    shell: 'available',
    phase: 1,
    aiAgents: 'not_configured',
    dataSources: 'not_connected',
    timestamp: new Date().toISOString(),
  });
}
