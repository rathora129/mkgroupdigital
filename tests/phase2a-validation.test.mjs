import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PERMISSIONS,
  ROLES,
  assignableRoles,
  canActOnMember,
  canAssignRole,
  hasPermission,
  permissionsFor,
} from '@/lib/auth/permissions';
import { sanitizeMetadata } from '@/lib/audit';
import {
  auditQuerySchema,
  inviteSchema,
  memberRoleSchema,
  workspaceProfileSchema,
} from '@/lib/workspace/validation';

test('owner holds every permission', () => {
  for (const permission of Object.values(PERMISSIONS)) {
    assert.equal(hasPermission('owner', permission), true);
  }
});

test('admin can manage the workspace but cannot grant owner', () => {
  assert.equal(hasPermission('admin', PERMISSIONS.workspaceEdit), true);
  assert.equal(hasPermission('admin', PERMISSIONS.membersManage), true);
  assert.equal(hasPermission('admin', PERMISSIONS.auditView), true);
  assert.equal(hasPermission('admin', PERMISSIONS.membersInvite), true);

  assert.equal(canAssignRole('admin', 'owner'), false);
  assert.equal(canAssignRole('admin', 'admin'), false);
  assert.equal(canAssignRole('admin', 'manager'), true);
  assert.equal(canActOnMember('admin', 'owner'), false);
  assert.equal(canActOnMember('admin', 'manager'), true);
});

test('read-only roles never gain management permissions', () => {
  for (const role of ['manager', 'member', 'specialist', 'viewer']) {
    assert.equal(hasPermission(role, PERMISSIONS.agentsView), true);
    assert.equal(hasPermission(role, PERMISSIONS.agentsManage), false);
    assert.equal(hasPermission(role, PERMISSIONS.membersManage), false);
    assert.equal(hasPermission(role, PERMISSIONS.workspaceEdit), false);
    assert.equal(hasPermission(role, PERMISSIONS.auditView), false);
    assert.deepEqual(assignableRoles(role), []);
  }

  assert.deepEqual(permissionsFor('manager'), [
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
  ]);

  for (const role of ['member', 'specialist']) {
    assert.deepEqual(permissionsFor(role), [
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
    ]);
    assert.equal(hasPermission(role, PERMISSIONS.approvalsReview), false);
    assert.equal(hasPermission(role, PERMISSIONS.leadsAssign), false);
    assert.equal(hasPermission(role, PERMISSIONS.leadsArchive), false);
    assert.equal(hasPermission(role, PERMISSIONS.auditsCancel), false);
  }

  assert.deepEqual(permissionsFor('viewer'), [
    PERMISSIONS.workspaceView,
    PERMISSIONS.membersView,
    PERMISSIONS.agentsView,
    PERMISSIONS.leadsView,
    PERMISSIONS.researchView,
    PERMISSIONS.auditsView,
    PERMISSIONS.opportunitiesView,
    PERMISSIONS.requirementsView,
    PERMISSIONS.servicesView,
  ]);
  assert.equal(hasPermission('viewer', PERMISSIONS.agentsRun), false);
  assert.equal(hasPermission('viewer', PERMISSIONS.leadsCreate), false);
  assert.equal(hasPermission('viewer', PERMISSIONS.researchCreate), false);
  assert.equal(hasPermission('viewer', PERMISSIONS.auditsCreate), false);
});

test('unknown roles hold no permissions', () => {
  assert.deepEqual(permissionsFor('superuser'), []);
  assert.equal(hasPermission(undefined, PERMISSIONS.workspaceView), false);
  assert.equal(hasPermission('owner', 'nonexistent.permission'), false);
});

test('workspace profile accepts real values and normalizes blanks', async () => {
  const result = await workspaceProfileSchema.validate({
    name: '  MK Group Digital  ',
    timezone: 'Asia/Kolkata',
    businessEmail: '',
    businessPhone: '  ',
    businessAddress: '',
    websiteUrl: 'https://mkgroupdigital.com',
    brandColor: '#4F46E5',
    logoUrl: '',
    preferences: { dateFormat: 'YYYY-MM-DD', weekStart: 'sunday' },
  });

  assert.equal(result.name, 'MK Group Digital');
  assert.equal(result.timezone, 'Asia/Kolkata');
  assert.equal(result.businessEmail, null);
  assert.equal(result.businessPhone, null);
  assert.equal(result.businessAddress, null);
  assert.equal(result.websiteUrl, 'https://mkgroupdigital.com');
  assert.equal(result.logoUrl, null);
  assert.equal(result.preferences.dateFormat, 'YYYY-MM-DD');
});

test('workspace profile rejects unsafe or invalid values', async () => {
  await assert.rejects(
    workspaceProfileSchema.validate({
      timezone: 'Mars/Olympus_Mons',
    }),
  );
  await assert.rejects(
    workspaceProfileSchema.validate({ websiteUrl: 'javascript:alert(1)' }),
  );
  await assert.rejects(
    workspaceProfileSchema.validate({ brandColor: 'red; background:url(x)' }),
  );
  await assert.rejects(
    workspaceProfileSchema.validate({ businessEmail: 'not-an-email' }),
  );
  await assert.rejects(
    workspaceProfileSchema.validate({
      preferences: { dateFormat: 'anything' },
    }),
  );
});

test('invitation schema accepts every workspace role', async () => {
  for (const role of ROLES) {
    const result = await inviteSchema.validate({
      email: 'new.member@example.com',
      role,
    });
    assert.equal(result.role, role);
  }
});

test('invitation schema defaults to member and rejects unknown roles', async () => {
  const result = await inviteSchema.validate({
    email: 'default.role@example.com',
  });
  assert.equal(result.role, 'member');

  await assert.rejects(
    inviteSchema.validate({ email: 'a@b.com', role: 'superuser' }),
  );
});

test('member role schema accepts all six roles only', async () => {
  for (const role of ROLES) {
    const result = await memberRoleSchema.validate({ role });
    assert.equal(result.role, role);
  }
  await assert.rejects(memberRoleSchema.validate({ role: 'guest' }));
});

test('audit query coerces pagination and rejects oversized pages', async () => {
  const defaults = await auditQuerySchema.validate({});
  assert.equal(defaults.page, 1);
  assert.equal(defaults.pageSize, 25);

  const coerced = await auditQuerySchema.validate({
    page: '3',
    pageSize: '50',
  });
  assert.equal(coerced.page, 3);
  assert.equal(coerced.pageSize, 50);

  await assert.rejects(auditQuerySchema.validate({ page: '0' }));
  await assert.rejects(auditQuerySchema.validate({ pageSize: '101' }));
  await assert.rejects(auditQuerySchema.validate({ success: 'maybe' }));
});

test('audit metadata removes secrets, truncates and caps depth', () => {
  const sanitized = sanitizeMetadata({
    note: 'kept',
    password: 'secret',
    resetToken: 'secret',
    apiKey: 'secret',
    cookie: 'secret',
    sessionId: 'secret',
    nested: { authorization: 'Bearer x', visible: 'kept' },
    list: Array.from({ length: 30 }, (_, index) => index),
    long: 'x'.repeat(400),
  });

  assert.equal(sanitized.note, 'kept');
  assert.equal(sanitized.password, undefined);
  assert.equal(sanitized.resetToken, undefined);
  assert.equal(sanitized.apiKey, undefined);
  assert.equal(sanitized.cookie, undefined);
  assert.equal(sanitized.sessionId, undefined);
  assert.equal(sanitized.nested.authorization, undefined);
  assert.equal(sanitized.nested.visible, 'kept');
  assert.equal(sanitized.list.length, 20);
  assert.equal(sanitized.long.length, 300);
});
