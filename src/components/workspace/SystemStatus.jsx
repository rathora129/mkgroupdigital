'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, CircleAlert, Loader2 } from 'lucide-react';
import styled from 'styled-components';

const Card = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  box-shadow: ${({ theme }) => theme.shadow.card};
`;

const Title = styled.h2`
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.muted};
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: ${({ theme, $tone }) =>
    $tone === 'success'
      ? theme.colors.success
      : $tone === 'danger'
        ? theme.colors.danger
        : theme.colors.muted};

  svg {
    flex-shrink: 0;
  }
`;

const Rows = styled.dl`
  display: flex;
  flex-direction: column;
  gap: 8px;

  div {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }

  div:last-child {
    border-bottom: 0;
    padding-bottom: 0;
  }

  dt {
    font-size: 0.76rem;
    color: ${({ theme }) => theme.colors.muted};
  }

  dd {
    margin: 0;
    font-size: 0.76rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    text-align: right;
  }
`;

const Endpoint = styled.code`
  padding: 2px 6px;
  border-radius: 5px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 0.7rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSoft};
`;

export default function SystemStatus() {
  const [state, setState] = useState({ status: 'loading', phase: null });

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/workforce/health', {
      signal: controller.signal,
      cache: 'no-store',
    })
      .then((response) => {
        if (!response.ok) throw new Error('Health check failed');
        return response.json();
      })
      .then((data) => {
        setState({ status: 'ok', phase: data.phase ?? null });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setState({ status: 'error', phase: null });
      });

    return () => controller.abort();
  }, []);

  const shellLabel =
    state.status === 'loading'
      ? 'Checking…'
      : state.status === 'ok'
        ? 'Available'
        : 'Unavailable';

  return (
    <Card aria-labelledby="system-status-title">
      <Title id="system-status-title">System status</Title>

      <StatusRow
        $tone={
          state.status === 'ok'
            ? 'success'
            : state.status === 'error'
              ? 'danger'
              : 'muted'
        }
        role="status"
        aria-live="polite"
      >
        {state.status === 'loading' ? (
          <Loader2 size={16} className="spin" />
        ) : state.status === 'ok' ? (
          <CheckCircle2 size={16} />
        ) : (
          <CircleAlert size={16} />
        )}
        <span>Application shell: {shellLabel}</span>
      </StatusRow>

      <Rows>
        <div>
          <dt>Health endpoint</dt>
          <dd>
            <Endpoint>/api/workforce/health</Endpoint>
          </dd>
        </div>
        <div>
          <dt>Phase</dt>
          <dd>{state.phase ? `Phase ${state.phase}` : 'Phase 1 · Foundation'}</dd>
        </div>
        <div>
          <dt>AI agents</dt>
          <dd>Not configured</dd>
        </div>
        <div>
          <dt>Business data</dt>
          <dd>Not connected</dd>
        </div>
      </Rows>
    </Card>
  );
}
