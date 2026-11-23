const ACTION_LABELS = {
  'auth.signin': 'Signed in',
  'auth.signout': 'Signed out',
  'auth.signin.denied': 'Sign-in denied',
  'auth.signin.rate_limited': 'Sign-in rate limited',
  'invitation.create': 'Invitation created',
  'invitation.resend': 'Invitation resent',
  'invitation.revoke': 'Invitation revoked',
  'invitation.accept': 'Invitation accepted',
  'membership.join': 'Member joined',
  'membership.role_update': 'Member role changed',
  'membership.remove': 'Member removed',
  'workspace.settings_update': 'Workspace settings updated',
  'ai_settings.update': 'AI settings updated',
  'ai_provider.update': 'AI provider updated',
  'agent.create': 'Agent created',
  'agent.update': 'Agent updated',
  'agent.archive': 'Agent archived',
  'agent_run.create': 'Agent run requested',
  'agent_run.start': 'Agent run started',
  'agent_run.completed': 'Agent run completed',
  'agent_run.failed': 'Agent run failed',
  'agent_run.cancel': 'Agent run cancelled',
  'agent_run.retry': 'Agent run retry scheduled',
  'approval.decide': 'Approval decision recorded',
};

const RESOURCE_LABELS = {
  session: 'Session',
  invitation: 'Invitation',
  membership: 'Membership',
  workspace: 'Workspace',
  member: 'Member',
  agent: 'Agent',
  agent_run: 'Agent run',
  approval: 'Approval',
  ai_provider: 'AI provider',
};

export function formatAuditAction(action) {
  if (!action) return 'Unknown action';
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  return action
    .split(/[._]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatResourceType(resourceType) {
  if (!resourceType) return '—';
  return RESOURCE_LABELS[resourceType] || resourceType;
}

export const AUDIT_ACTION_OPTIONS = Object.keys(ACTION_LABELS);

export const AUDIT_RESOURCE_OPTIONS = Object.keys(RESOURCE_LABELS);
