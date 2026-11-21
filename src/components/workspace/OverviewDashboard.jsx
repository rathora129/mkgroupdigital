'use client';

import Link from 'next/link';
import {
  Activity,
  ArrowUpRight,
  Bot,
  ChevronRight,
  Inbox,
  Sparkles,
} from 'lucide-react';
import styled from 'styled-components';
import { workspaceMedia } from '@/styles/workspaceTheme';
import {
  overviewStats,
  quickActions,
  workspaceSections,
} from '@/data/workspace';
import SystemStatus from './SystemStatus';

const Page = styled.div`
  display: flex;
  flex-direction: column;
`;

const Welcome = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  align-items: start;

  ${workspaceMedia.down('md')} {
    grid-template-columns: 1fr;
  }
`;

const WelcomeCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  padding: clamp(20px, 3vw, 30px);
  border-radius: ${({ theme }) => theme.radius.xl};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  box-shadow: ${({ theme }) => theme.shadow.card};
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.primaryBorder};
  background: ${({ theme }) => theme.colors.primarySoft};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const WelcomeTitle = styled.h1`
  font-size: clamp(1.65rem, 3.4vw, 2.15rem);
  letter-spacing: -0.03em;
  max-width: 640px;
`;

const WelcomeText = styled.p`
  max-width: 640px;
  font-size: 0.9rem;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.muted};
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 4px;
`;

const PrimaryLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 40px;
  padding: 0 16px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.colors.primary};
  color: #FFFFFF;
  font-size: 0.82rem;
  font-weight: 600;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const SecondaryLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 40px;
  padding: 0 16px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.textSoft};
  font-size: 0.82rem;
  font-weight: 600;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primaryBorder};
    background: ${({ theme }) => theme.colors.primarySoft};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const SectionHead = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin: 30px 0 12px;
`;

const SectionTitle = styled.h2`
  font-size: 1.02rem;
  letter-spacing: -0.015em;
`;

const SectionSub = styled.p`
  margin-top: 4px;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.muted};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;

  ${workspaceMedia.down('md')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  ${workspaceMedia.down('xs')} {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  box-shadow: ${({ theme }) => theme.shadow.card};
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primaryBorder};
    transform: translateY(-1px);
  }
`;

const StatTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSoft};

  svg {
    color: ${({ theme }) => theme.colors.faint};
  }
`;

const StatValue = styled.p`
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.2;
  color: ${({ theme }) => theme.colors.textSoft};
`;

const StatNote = styled.p`
  font-size: 0.72rem;
  color: ${({ theme }) => theme.colors.muted};
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  gap: 16px;
  align-items: start;

  ${workspaceMedia.down('md')} {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  box-shadow: ${({ theme }) => theme.shadow.card};
`;

const PanelTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  h2 {
    font-size: 0.92rem;
    font-weight: 600;
  }
`;

const PanelLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.76rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  white-space: nowrap;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const EmptyState = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px dashed ${({ theme }) => theme.colors.borderStrong};
  background: ${({ theme }) => theme.colors.surface};

  h3 {
    font-size: 0.84rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textSoft};
  }

  p {
    margin-top: 4px;
    font-size: 0.78rem;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const EmptyIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 9px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceRaised};
  color: ${({ theme }) => theme.colors.muted};
`;

const ActionList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 2px;

  a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 2px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    font-size: 0.82rem;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textSoft};
  }

  li:last-child a {
    border-bottom: 0;
    padding-bottom: 0;
  }

  a:hover {
    color: ${({ theme }) => theme.colors.primary};

    svg {
      color: ${({ theme }) => theme.colors.primary};
    }
  }

  svg {
    flex-shrink: 0;
    color: ${({ theme }) => theme.colors.faint};
  }
`;

export default function OverviewDashboard() {
  return (
    <Page>
      <Welcome aria-labelledby="welcome-title">
        <WelcomeCard>
          <Badge>
            <Sparkles size={12} aria-hidden="true" />
            Phase 1 · Application shell
          </Badge>
          <WelcomeTitle id="welcome-title">Welcome to your workspace</WelcomeTitle>
          <WelcomeText>
            MK AI Workforce is the AI-powered business operations layer for MK
            Group Digital. This Phase 1 build provides the application shell and
            navigation only — no AI agents, automations or live business data are
            connected yet.
          </WelcomeText>
          <Actions>
            <PrimaryLink href="/workspace/ai-workforce">
              Explore AI Workforce
              <ChevronRight size={15} aria-hidden="true" />
            </PrimaryLink>
            <SecondaryLink href="/workspace/tasks">
              Open Tasks
            </SecondaryLink>
          </Actions>
        </WelcomeCard>

        <SystemStatus />
      </Welcome>

      <SectionHead>
        <div>
          <SectionTitle>Workspace overview</SectionTitle>
          <SectionSub>
            Counts appear here once a module is connected to real data.
          </SectionSub>
        </div>
      </SectionHead>

      <StatsGrid>
        {overviewStats.map((stat) => {
          const section = workspaceSections[stat.key];
          const Icon = section.icon;
          return (
            <StatCard key={stat.key} href={section.href}>
              <StatTop>
                <span>{stat.label}</span>
                <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
              </StatTop>
              <StatValue>No data</StatValue>
              <StatNote>Not connected yet</StatNote>
            </StatCard>
          );
        })}
      </StatsGrid>

      <SectionHead>
        <div>
          <SectionTitle>Work in progress</SectionTitle>
          <SectionSub>
            These panels stay empty until their modules are implemented.
          </SectionSub>
        </div>
      </SectionHead>

      <TwoCol>
        <Panel aria-labelledby="tasks-panel-title">
          <PanelTop>
            <h2 id="tasks-panel-title">Tasks</h2>
            <PanelLink href="/workspace/tasks">
              Open Tasks <ChevronRight size={13} />
            </PanelLink>
          </PanelTop>
          <EmptyState>
            <EmptyIcon>
              <Inbox size={17} aria-hidden="true" />
            </EmptyIcon>
            <div>
              <h3>No tasks yet</h3>
              <p>
                Task creation, assignment and tracking are not implemented in
                Phase 1. Nothing is scheduled or running.
              </p>
            </div>
          </EmptyState>
        </Panel>

        <Panel aria-labelledby="workforce-panel-title">
          <PanelTop>
            <h2 id="workforce-panel-title">AI workforce</h2>
            <PanelLink href="/workspace/ai-workforce">
              Open <ChevronRight size={13} />
            </PanelLink>
          </PanelTop>
          <EmptyState>
            <EmptyIcon>
              <Bot size={17} aria-hidden="true" />
            </EmptyIcon>
            <div>
              <h3>No agents configured</h3>
              <p>
                No AI agents are running. Agent roles, instructions and approval
                checkpoints will be configured in a later phase.
              </p>
            </div>
          </EmptyState>
        </Panel>
      </TwoCol>

      <SectionHead>
        <div>
          <SectionTitle>Recent activity</SectionTitle>
          <SectionSub>
            Actions taken in the workspace will be recorded here.
          </SectionSub>
        </div>
      </SectionHead>

      <TwoCol>
        <Panel aria-labelledby="activity-panel-title">
          <PanelTop>
            <h2 id="activity-panel-title">Activity</h2>
          </PanelTop>
          <EmptyState>
            <EmptyIcon>
              <Activity size={17} aria-hidden="true" />
            </EmptyIcon>
            <div>
              <h3>No activity yet</h3>
              <p>
                There is no activity log in Phase 1. Events will appear here once
                modules begin recording changes.
              </p>
            </div>
          </EmptyState>
        </Panel>

        <Panel aria-labelledby="quick-actions-title">
          <PanelTop>
            <h2 id="quick-actions-title">Quick actions</h2>
          </PanelTop>
          <ActionList>
            {quickActions.map((action) => {
              const section = workspaceSections[action.key];
              return (
                <li key={action.key}>
                  <Link href={section.href}>
                    <span>{action.label}</span>
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ActionList>
        </Panel>
      </TwoCol>
    </Page>
  );
}
