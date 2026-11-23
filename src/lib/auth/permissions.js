export const ROLES = [
  'owner',
  'admin',
  'manager',
  'member',
  'specialist',
  'viewer',
];

export const ROLE_LABELS = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  member: 'Member',
  specialist: 'Specialist',
  viewer: 'Viewer',
};

export const PERMISSIONS = {
  workspaceView: 'workspace.view',
  workspaceEdit: 'workspace.edit',
  membersView: 'members.view',
  membersInvite: 'members.invite',
  membersManage: 'members.manage',
  auditView: 'audit.view',
  agentsView: 'agents.view',
  agentsManage: 'agents.manage',
  agentsRun: 'agents.run',
  approvalsReview: 'approvals.review',
  leadsView: 'leads.view',
  leadsCreate: 'leads.create',
  leadsUpdate: 'leads.update',
  leadsAssign: 'leads.assign',
  leadsArchive: 'leads.archive',
  researchView: 'research.view',
  researchCreate: 'research.create',
  auditsView: 'audits.view',
  auditsCreate: 'audits.create',
  auditsCancel: 'audits.cancel',
  opportunitiesView: 'opportunities.view',
  opportunitiesCreate: 'opportunities.create',
  opportunitiesUpdate: 'opportunities.update',
  opportunitiesAssign: 'opportunities.assign',
  opportunitiesClose: 'opportunities.close',
  requirementsView: 'requirements.view',
  requirementsEdit: 'requirements.edit',
  servicesView: 'services.view',
  servicesManage: 'services.manage',
};

// Every permission a role holds. The browser only uses this list to decide
// which controls to show; the server re-checks the stored membership role for
// every request.
const GRANTS = {
  owner: [
    PERMISSIONS.workspaceView,
    PERMISSIONS.workspaceEdit,
    PERMISSIONS.membersView,
    PERMISSIONS.membersInvite,
    PERMISSIONS.membersManage,
    PERMISSIONS.auditView,
    PERMISSIONS.agentsView,
    PERMISSIONS.agentsManage,
    PERMISSIONS.agentsRun,
    PERMISSIONS.approvalsReview,
    PERMISSIONS.leadsView,
    PERMISSIONS.leadsCreate,
    PERMISSIONS.leadsUpdate,
    PERMISSIONS.leadsAssign,
    PERMISSIONS.leadsArchive,
    PERMISSIONS.researchView,
    PERMISSIONS.researchCreate,
    PERMISSIONS.auditsView,
    PERMISSIONS.auditsCreate,
    PERMISSIONS.auditsCancel,
    PERMISSIONS.opportunitiesView,
    PERMISSIONS.opportunitiesCreate,
    PERMISSIONS.opportunitiesUpdate,
    PERMISSIONS.opportunitiesAssign,
    PERMISSIONS.opportunitiesClose,
    PERMISSIONS.requirementsView,
    PERMISSIONS.requirementsEdit,
    PERMISSIONS.servicesView,
    PERMISSIONS.servicesManage,
  ],
  admin: [
    PERMISSIONS.workspaceView,
    PERMISSIONS.workspaceEdit,
    PERMISSIONS.membersView,
    PERMISSIONS.membersInvite,
    PERMISSIONS.membersManage,
    PERMISSIONS.auditView,
    PERMISSIONS.agentsView,
    PERMISSIONS.agentsManage,
    PERMISSIONS.agentsRun,
    PERMISSIONS.approvalsReview,
    PERMISSIONS.leadsView,
    PERMISSIONS.leadsCreate,
    PERMISSIONS.leadsUpdate,
    PERMISSIONS.leadsAssign,
    PERMISSIONS.leadsArchive,
    PERMISSIONS.researchView,
    PERMISSIONS.researchCreate,
    PERMISSIONS.auditsView,
    PERMISSIONS.auditsCreate,
    PERMISSIONS.auditsCancel,
    PERMISSIONS.opportunitiesView,
    PERMISSIONS.opportunitiesCreate,
    PERMISSIONS.opportunitiesUpdate,
    PERMISSIONS.opportunitiesAssign,
    PERMISSIONS.opportunitiesClose,
    PERMISSIONS.requirementsView,
    PERMISSIONS.requirementsEdit,
    PERMISSIONS.servicesView,
    PERMISSIONS.servicesManage,
  ],
  manager: [
    PERMISSIONS.workspaceView,
    PERMISSIONS.membersView,
    PERMISSIONS.agentsView,
    PERMISSIONS.agentsRun,
    PERMISSIONS.approvalsReview,
    PERMISSIONS.leadsView,
    PERMISSIONS.leadsCreate,
    PERMISSIONS.leadsUpdate,
    PERMISSIONS.leadsAssign,
    PERMISSIONS.leadsArchive,
    PERMISSIONS.researchView,
    PERMISSIONS.researchCreate,
    PERMISSIONS.auditsView,
    PERMISSIONS.auditsCreate,
    PERMISSIONS.auditsCancel,
    PERMISSIONS.opportunitiesView,
    PERMISSIONS.opportunitiesCreate,
    PERMISSIONS.opportunitiesUpdate,
    PERMISSIONS.opportunitiesAssign,
    PERMISSIONS.opportunitiesClose,
    PERMISSIONS.requirementsView,
    PERMISSIONS.requirementsEdit,
    PERMISSIONS.servicesView,
    PERMISSIONS.servicesManage,
  ],
  member: [
    PERMISSIONS.workspaceView,
    PERMISSIONS.membersView,
    PERMISSIONS.agentsView,
    PERMISSIONS.agentsRun,
    PERMISSIONS.leadsView,
    PERMISSIONS.leadsCreate,
    PERMISSIONS.leadsUpdate,
    PERMISSIONS.researchView,
    PERMISSIONS.researchCreate,
    PERMISSIONS.auditsView,
    PERMISSIONS.auditsCreate,
    PERMISSIONS.opportunitiesView,
    PERMISSIONS.opportunitiesCreate,
    PERMISSIONS.opportunitiesUpdate,
    PERMISSIONS.requirementsView,
    PERMISSIONS.requirementsEdit,
    PERMISSIONS.servicesView,
  ],
  specialist: [
    PERMISSIONS.workspaceView,
    PERMISSIONS.membersView,
    PERMISSIONS.agentsView,
    PERMISSIONS.agentsRun,
    PERMISSIONS.leadsView,
    PERMISSIONS.leadsCreate,
    PERMISSIONS.leadsUpdate,
    PERMISSIONS.researchView,
    PERMISSIONS.researchCreate,
    PERMISSIONS.auditsView,
    PERMISSIONS.auditsCreate,
    PERMISSIONS.opportunitiesView,
    PERMISSIONS.opportunitiesCreate,
    PERMISSIONS.opportunitiesUpdate,
    PERMISSIONS.requirementsView,
    PERMISSIONS.requirementsEdit,
    PERMISSIONS.servicesView,
  ],
  viewer: [
    PERMISSIONS.workspaceView,
    PERMISSIONS.membersView,
    PERMISSIONS.agentsView,
    PERMISSIONS.leadsView,
    PERMISSIONS.researchView,
    PERMISSIONS.auditsView,
    PERMISSIONS.opportunitiesView,
    PERMISSIONS.requirementsView,
    PERMISSIONS.servicesView,
  ],
};

export function isRole(value) {
  return ROLES.includes(value);
}

export function permissionsFor(role) {
  return [...(GRANTS[role] || [])];
}

export function hasPermission(role, permission) {
  return Boolean(role) && permissionsFor(role).includes(permission);
}

// Only an owner may create, promote or demote another owner. Admins can grant
// every other role but never owner, so a compromised admin cannot take over.
export function assignableRoles(actorRole) {
  if (actorRole === 'owner') return [...ROLES];
  if (actorRole === 'admin') {
    return ['manager', 'member', 'specialist', 'viewer'];
  }
  return [];
}

export function canAssignRole(actorRole, role) {
  return assignableRoles(actorRole).includes(role);
}

export function canActOnMember(actorRole, targetRole) {
  if (actorRole === 'owner') return true;
  if (actorRole === 'admin') return targetRole !== 'owner';
  return false;
}
