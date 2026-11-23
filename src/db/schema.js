import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const memberRole = pgEnum('member_role', [
  'owner',
  'admin',
  'manager',
  'member',
  'specialist',
  'viewer',
]);

export const invitationStatus = pgEnum('invitation_status', [
  'pending',
  'accepted',
  'revoked',
]);

export const agentType = pgEnum('agent_type', [
  'business_research',
  'lead_research',
  'website_audit',
  'seo_analysis',
  'sales_assistant',
  'proposal_generator',
  'project_assistant',
  'accounting_assistant',
  'compliance_assistant',
  'documentation_assistant',
  'industrial_research',
  'customer_support',
  'custom',
]);

export const agentRunStatus = pgEnum('agent_run_status', [
  'queued',
  'running',
  'completed',
  'failed',
  'cancelled',
  'awaiting_approval',
]);

export const approvalStatus = pgEnum('approval_status', [
  'pending',
  'approved',
  'rejected',
  'cancelled',
]);

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name'),
    email: text('email').notNull(),
    emailVerified: timestamp('email_verified', {
      withTimezone: true,
      mode: 'date',
    }),
    image: text('image'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex('users_email_unique').on(table.email)],
);

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.identifier, table.token] }),
  ],
);

export const workspaces = pgTable(
  'workspaces',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    timezone: text('timezone').notNull().default('UTC'),
    businessEmail: text('business_email'),
    businessPhone: text('business_phone'),
    businessAddress: text('business_address'),
    websiteUrl: text('website_url'),
    brandColor: text('brand_color'),
    logoUrl: text('logo_url'),
    preferences: jsonb('preferences').notNull().default({}),
    aiMonthlyTokenLimit: integer('ai_monthly_token_limit'),
    aiMonthlyBudgetCents: integer('ai_monthly_budget_cents'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex('workspaces_slug_unique').on(table.slug)],
);

export const workspaceMemberships = pgTable(
  'workspace_memberships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: memberRole('role').notNull().default('member'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('workspace_memberships_workspace_user_unique').on(
      table.workspaceId,
      table.userId,
    ),
    index('workspace_memberships_user_idx').on(table.userId),
    index('workspace_memberships_workspace_idx').on(table.workspaceId),
  ],
);

export const invitations = pgTable(
  'invitations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: memberRole('role').notNull().default('member'),
    status: invitationStatus('status').notNull().default('pending'),
    invitedByUserId: uuid('invited_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    expiresAt: timestamp('expires_at', {
      withTimezone: true,
      mode: 'date',
    }).notNull(),
    acceptedAt: timestamp('accepted_at', {
      withTimezone: true,
      mode: 'date',
    }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('invitations_workspace_email_unique').on(
      table.workspaceId,
      table.email,
    ),
    index('invitations_workspace_status_idx').on(
      table.workspaceId,
      table.status,
    ),
    index('invitations_email_idx').on(table.email),
  ],
);

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id').references(() => workspaces.id, {
      onDelete: 'set null',
    }),
    actorUserId: uuid('actor_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    actorType: text('actor_type').notNull().default('user'),
    action: text('action').notNull(),
    resourceType: text('resource_type'),
    resourceId: text('resource_id'),
    success: boolean('success').notNull().default(true),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('audit_logs_workspace_created_idx').on(
      table.workspaceId,
      table.createdAt,
    ),
    index('audit_logs_actor_idx').on(table.actorUserId),
    index('audit_logs_action_idx').on(table.action),
    index('audit_logs_workspace_resource_idx').on(
      table.workspaceId,
      table.resourceType,
      table.resourceId,
    ),
  ],
);

export const agents = pgTable(
  'agents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    type: agentType('type').notNull().default('custom'),
    instructions: text('instructions').notNull(),
    provider: text('provider').notNull().default('openai'),
    model: text('model').notNull(),
    enabled: boolean('enabled').notNull().default(true),
    toolPermissions: jsonb('tool_permissions').notNull().default([]),
    allowedWorkflows: jsonb('allowed_workflows').notNull().default([]),
    monthlyTokenLimit: integer('monthly_token_limit'),
    monthlyBudgetCents: integer('monthly_budget_cents'),
    approvalRequired: boolean('approval_required').notNull().default(false),
    createdByUserId: uuid('created_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('agents_workspace_name_unique').on(
      table.workspaceId,
      table.name,
    ),
    index('agents_workspace_status_idx').on(table.workspaceId, table.enabled),
  ],
);

export const agentRuns = pgTable(
  'agent_runs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    agentId: uuid('agent_id')
      .notNull()
      .references(() => agents.id, { onDelete: 'cascade' }),
    status: agentRunStatus('status').notNull().default('queued'),
    input: jsonb('input').notNull().default({}),
    output: jsonb('output'),
    errorMessage: text('error_message'),
    promptTokens: integer('prompt_tokens').notNull().default(0),
    completionTokens: integer('completion_tokens').notNull().default(0),
    costEstimateCents: integer('cost_estimate_cents').notNull().default(0),
    durationMs: integer('duration_ms'),
    attempts: integer('attempts').notNull().default(0),
    approvalRequired: boolean('approval_required').notNull().default(false),
    cancelRequested: boolean('cancel_requested').notNull().default(false),
    requestedByUserId: uuid('requested_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    idempotencyKey: text('idempotency_key'),
    jobId: text('job_id'),
    startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' }),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('agent_runs_idempotency_unique')
      .on(table.workspaceId, table.idempotencyKey)
      .where(sql`${table.idempotencyKey} is not null`),
    index('agent_runs_workspace_created_idx').on(
      table.workspaceId,
      table.createdAt,
    ),
    index('agent_runs_workspace_status_idx').on(
      table.workspaceId,
      table.status,
    ),
    index('agent_runs_agent_created_idx').on(table.agentId, table.createdAt),
  ],
);

export const agentRunLogs = pgTable(
  'agent_run_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    runId: uuid('run_id')
      .notNull()
      .references(() => agentRuns.id, { onDelete: 'cascade' }),
    level: text('level').notNull().default('info'),
    message: text('message').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('agent_run_logs_run_created_idx').on(table.runId, table.createdAt),
    index('agent_run_logs_workspace_created_idx').on(
      table.workspaceId,
      table.createdAt,
    ),
  ],
);

export const approvals = pgTable(
  'approvals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    resourceType: text('resource_type').notNull().default('agent_run'),
    resourceId: uuid('resource_id').notNull(),
    status: approvalStatus('status').notNull().default('pending'),
    requestedByUserId: uuid('requested_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    decidedByUserId: uuid('decided_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    decisionNote: text('decision_note'),
    decidedAt: timestamp('decided_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('approvals_pending_resource_unique')
      .on(table.resourceType, table.resourceId)
      .where(sql`${table.status} = 'pending'`),
    index('approvals_workspace_status_idx').on(table.workspaceId, table.status),
    index('approvals_workspace_resource_idx').on(
      table.workspaceId,
      table.resourceType,
      table.resourceId,
    ),
  ],
);

export const aiProviderSettings = pgTable(
  'ai_provider_settings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    enabled: boolean('enabled').notNull().default(true),
    defaultModel: text('default_model'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('ai_provider_settings_workspace_provider_unique').on(
      table.workspaceId,
      table.provider,
    ),
  ],
);

// ---------------------------------------------------------------------------
// Phase 2C — leads, research and website audits
// ---------------------------------------------------------------------------

export const leadStatus = pgEnum('lead_status', [
  'new',
  'researching',
  'qualified',
  'contacted',
  'meeting',
  'proposal',
  'won',
  'lost',
]);

export const leadPriority = pgEnum('lead_priority', [
  'low',
  'medium',
  'high',
  'urgent',
]);

export const researchStatus = pgEnum('research_status', [
  'queued',
  'running',
  'awaiting_approval',
  'completed',
  'failed',
  'cancelled',
]);

export const researchSubjectType = pgEnum('research_subject_type', [
  'company',
  'website',
  'industry',
  'lead',
]);

export const researchVerification = pgEnum('research_verification', [
  'verified',
  'source_derived',
  'ai_analysis',
  'unverified',
]);

export const websiteAuditStatus = pgEnum('website_audit_status', [
  'queued',
  'running',
  'completed',
  'failed',
  'cancelled',
]);

export const websiteAuditSeverity = pgEnum('website_audit_severity', [
  'critical',
  'high',
  'medium',
  'low',
  'info',
]);

export const leads = pgTable(
  'leads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    companyName: text('company_name').notNull(),
    contactName: text('contact_name'),
    email: text('email'),
    phone: text('phone'),
    website: text('website'),
    industry: text('industry'),
    businessType: text('business_type'),
    location: text('location'),
    country: text('country'),
    source: text('source').notNull().default('other'),
    estimatedValueCents: integer('estimated_value_cents'),
    currency: text('currency').notNull().default('INR'),
    assignedUserId: uuid('assigned_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    priority: leadPriority('priority').notNull().default('medium'),
    status: leadStatus('status').notNull().default('new'),
    nextFollowUpAt: timestamp('next_follow_up_at', {
      withTimezone: true,
      mode: 'date',
    }),
    notes: text('notes'),
    createdByUserId: uuid('created_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('leads_workspace_created_idx').on(table.workspaceId, table.createdAt),
    index('leads_workspace_status_idx').on(table.workspaceId, table.status),
    index('leads_workspace_archived_idx').on(table.workspaceId, table.archivedAt),
    index('leads_workspace_assigned_idx').on(
      table.workspaceId,
      table.assignedUserId,
    ),
    index('leads_workspace_email_idx').on(table.workspaceId, table.email),
    index('leads_workspace_website_idx').on(table.workspaceId, table.website),
  ],
);

export const leadActivities = pgTable(
  'lead_activities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    leadId: uuid('lead_id')
      .notNull()
      .references(() => leads.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    body: text('body'),
    metadata: jsonb('metadata'),
    actorUserId: uuid('actor_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('lead_activities_lead_created_idx').on(
      table.leadId,
      table.createdAt,
    ),
    index('lead_activities_workspace_created_idx').on(
      table.workspaceId,
      table.createdAt,
    ),
  ],
);

export const leadStatusHistory = pgTable(
  'lead_status_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    leadId: uuid('lead_id')
      .notNull()
      .references(() => leads.id, { onDelete: 'cascade' }),
    fromStatus: leadStatus('from_status'),
    toStatus: leadStatus('to_status').notNull(),
    note: text('note'),
    changedByUserId: uuid('changed_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('lead_status_history_lead_created_idx').on(
      table.leadId,
      table.createdAt,
    ),
    index('lead_status_history_workspace_created_idx').on(
      table.workspaceId,
      table.createdAt,
    ),
  ],
);

export const researchJobs = pgTable(
  'research_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    status: researchStatus('status').notNull().default('queued'),
    subjectType: researchSubjectType('subject_type').notNull().default('company'),
    leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'set null' }),
    agentId: uuid('agent_id').references(() => agents.id, {
      onDelete: 'set null',
    }),
    runId: uuid('run_id').references(() => agentRuns.id, {
      onDelete: 'set null',
    }),
    companyName: text('company_name'),
    websiteUrl: text('website_url'),
    industry: text('industry'),
    objective: text('objective').notNull(),
    context: jsonb('context').notNull().default({}),
    output: jsonb('output'),
    errorMessage: text('error_message'),
    sourceCount: integer('source_count').notNull().default(0),
    cancelRequested: boolean('cancel_requested').notNull().default(false),
    jobId: text('job_id'),
    requestedByUserId: uuid('requested_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' }),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('research_jobs_workspace_created_idx').on(
      table.workspaceId,
      table.createdAt,
    ),
    index('research_jobs_workspace_status_idx').on(
      table.workspaceId,
      table.status,
    ),
    index('research_jobs_run_idx').on(table.runId),
  ],
);

export const researchFindings = pgTable(
  'research_findings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    researchId: uuid('research_id')
      .notNull()
      .references(() => researchJobs.id, { onDelete: 'cascade' }),
    category: text('category').notNull().default('overview'),
    title: text('title').notNull(),
    detail: text('detail').notNull(),
    verification: researchVerification('verification')
      .notNull()
      .default('unverified'),
    sourceUrl: text('source_url'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('research_findings_research_idx').on(
      table.researchId,
      table.category,
    ),
    index('research_findings_workspace_idx').on(table.workspaceId),
  ],
);

export const researchSources = pgTable(
  'research_sources',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    researchId: uuid('research_id')
      .notNull()
      .references(() => researchJobs.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    title: text('title'),
    kind: text('kind').notNull().default('website'),
    httpStatus: integer('http_status'),
    retrievedAt: timestamp('retrieved_at', {
      withTimezone: true,
      mode: 'date',
    })
      .notNull()
      .defaultNow(),
    excerpt: text('excerpt'),
  },
  (table) => [
    index('research_sources_research_idx').on(table.researchId),
    index('research_sources_workspace_idx').on(table.workspaceId),
  ],
);

export const websiteAudits = pgTable(
  'website_audits',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    status: websiteAuditStatus('status').notNull().default('queued'),
    requestedUrl: text('requested_url').notNull(),
    normalizedUrl: text('normalized_url').notNull(),
    domain: text('domain').notNull(),
    maxPages: integer('max_pages').notNull().default(5),
    pagesScanned: integer('pages_scanned').notNull().default(0),
    overallScore: integer('overall_score'),
    categoryScores: jsonb('category_scores'),
    scoringMethod: text('scoring_method'),
    errorMessage: text('error_message'),
    cancelRequested: boolean('cancel_requested').notNull().default(false),
    jobId: text('job_id'),
    requestedByUserId: uuid('requested_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' }),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('website_audits_workspace_created_idx').on(
      table.workspaceId,
      table.createdAt,
    ),
    index('website_audits_workspace_status_idx').on(
      table.workspaceId,
      table.status,
    ),
    index('website_audits_workspace_url_idx').on(
      table.workspaceId,
      table.normalizedUrl,
    ),
  ],
);

export const websiteAuditPages = pgTable(
  'website_audit_pages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    auditId: uuid('audit_id')
      .notNull()
      .references(() => websiteAudits.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    finalUrl: text('final_url'),
    statusCode: integer('status_code'),
    contentType: text('content_type'),
    responseTimeMs: integer('response_time_ms'),
    htmlBytes: integer('html_bytes'),
    redirectCount: integer('redirect_count').notNull().default(0),
    indexable: boolean('indexable'),
    title: text('title'),
    metaDescription: text('meta_description'),
    h1Count: integer('h1_count'),
    imagesMissingAlt: integer('images_missing_alt'),
    internalLinks: integer('internal_links'),
    externalLinks: integer('external_links'),
    jsonLdBlocks: integer('json_ld_blocks'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('website_audit_pages_audit_idx').on(table.auditId),
    index('website_audit_pages_workspace_idx').on(table.workspaceId),
  ],
);

export const websiteAuditFindings = pgTable(
  'website_audit_findings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    auditId: uuid('audit_id')
      .notNull()
      .references(() => websiteAudits.id, { onDelete: 'cascade' }),
    category: text('category').notNull(),
    severity: websiteAuditSeverity('severity').notNull().default('info'),
    code: text('code').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    evidence: text('evidence'),
    recommendation: text('recommendation').notNull(),
    sourcePage: text('source_page'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('website_audit_findings_audit_idx').on(
      table.auditId,
      table.category,
    ),
    index('website_audit_findings_workspace_idx').on(table.workspaceId),
  ],
);

export const websiteAuditLogs = pgTable(
  'website_audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    auditId: uuid('audit_id')
      .notNull()
      .references(() => websiteAudits.id, { onDelete: 'cascade' }),
    level: text('level').notNull().default('info'),
    message: text('message').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('website_audit_logs_audit_created_idx').on(
      table.auditId,
      table.createdAt,
    ),
    index('website_audit_logs_workspace_idx').on(table.workspaceId),
  ],
);

// ---------------------------------------------------------------------------
// Phase 2D — sales pipeline, discovery, requirements and service catalogue
// ---------------------------------------------------------------------------

export const opportunityStage = pgEnum('opportunity_stage', [
  'discovery',
  'requirements',
  'proposal',
  'negotiation',
  'won',
  'lost',
]);

export const discoveryStatus = pgEnum('discovery_status', [
  'draft',
  'in_review',
  'approved',
  'archived',
]);

export const requirementItemStatus = pgEnum('requirement_item_status', [
  'requested',
  'in_review',
  'confirmed',
  'deferred',
]);

export const serviceStatus = pgEnum('service_status', ['active', 'archived']);

export const serviceCategories = pgTable(
  'service_categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    sortOrder: integer('sort_order').notNull().default(0),
    status: serviceStatus('status').notNull().default('active'),
    createdByUserId: uuid('created_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('service_categories_workspace_slug_unique').on(
      table.workspaceId,
      table.slug,
    ),
    index('service_categories_workspace_status_idx').on(
      table.workspaceId,
      table.status,
    ),
  ],
);

export const services = pgTable(
  'services',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => serviceCategories.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    billingType: text('billing_type').notNull().default('custom'),
    regulated: boolean('regulated').notNull().default(false),
    reviewProfession: text('review_profession'),
    reviewNotes: text('review_notes'),
    status: serviceStatus('status').notNull().default('active'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdByUserId: uuid('created_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('services_workspace_slug_unique').on(
      table.workspaceId,
      table.slug,
    ),
    index('services_workspace_category_idx').on(
      table.workspaceId,
      table.categoryId,
    ),
    index('services_workspace_status_idx').on(table.workspaceId, table.status),
  ],
);

export const opportunities = pgTable(
  'opportunities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    leadId: uuid('lead_id')
      .notNull()
      .references(() => leads.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    stage: opportunityStage('stage').notNull().default('discovery'),
    priority: leadPriority('priority').notNull().default('medium'),
    expectedValueCents: integer('expected_value_cents'),
    currency: text('currency').notNull().default('INR'),
    expectedCloseDate: timestamp('expected_close_date', {
      withTimezone: true,
      mode: 'date',
    }),
    nextFollowUpAt: timestamp('next_follow_up_at', {
      withTimezone: true,
      mode: 'date',
    }),
    ownerUserId: uuid('owner_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    source: text('source').notNull().default('other'),
    summary: text('summary'),
    lostReason: text('lost_reason'),
    createdByUserId: uuid('created_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('opportunities_workspace_created_idx').on(
      table.workspaceId,
      table.createdAt,
    ),
    index('opportunities_workspace_stage_idx').on(
      table.workspaceId,
      table.stage,
    ),
    index('opportunities_workspace_lead_idx').on(
      table.workspaceId,
      table.leadId,
    ),
    index('opportunities_workspace_owner_idx').on(
      table.workspaceId,
      table.ownerUserId,
    ),
    index('opportunities_workspace_followup_idx').on(
      table.workspaceId,
      table.nextFollowUpAt,
    ),
  ],
);

export const opportunityDiscoveries = pgTable(
  'opportunity_discoveries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    opportunityId: uuid('opportunity_id')
      .notNull()
      .references(() => opportunities.id, { onDelete: 'cascade' }),
    status: discoveryStatus('status').notNull().default('draft'),
    companyOverview: text('company_overview'),
    industry: text('industry'),
    businessModel: text('business_model'),
    challenges: text('challenges'),
    websitePresence: text('website_presence'),
    technologyRequirements: text('technology_requirements'),
    marketingRequirements: text('marketing_requirements'),
    financeRequirements: text('finance_requirements'),
    complianceRequirements: text('compliance_requirements'),
    expectedOutcomes: text('expected_outcomes'),
    budgetRange: text('budget_range'),
    timeline: text('timeline'),
    specialRequirements: text('special_requirements'),
    internalNotes: text('internal_notes'),
    completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
    createdByUserId: uuid('created_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    updatedByUserId: uuid('updated_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex('opportunity_discoveries_opportunity_unique').on(
      table.opportunityId,
    ),
    index('opportunity_discoveries_workspace_status_idx').on(
      table.workspaceId,
      table.status,
    ),
  ],
);

export const opportunityRequirementItems = pgTable(
  'opportunity_requirement_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    opportunityId: uuid('opportunity_id')
      .notNull()
      .references(() => opportunities.id, { onDelete: 'cascade' }),
    serviceId: uuid('service_id').references(() => services.id, {
      onDelete: 'set null',
    }),
    name: text('name').notNull(),
    description: text('description'),
    priority: leadPriority('priority').notNull().default('medium'),
    status: requirementItemStatus('status').notNull().default('requested'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdByUserId: uuid('created_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('opportunity_requirement_items_opportunity_idx').on(
      table.opportunityId,
      table.status,
    ),
    index('opportunity_requirement_items_workspace_idx').on(table.workspaceId),
  ],
);

export const opportunityActivities = pgTable(
  'opportunity_activities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    opportunityId: uuid('opportunity_id')
      .notNull()
      .references(() => opportunities.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    body: text('body'),
    metadata: jsonb('metadata'),
    actorUserId: uuid('actor_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('opportunity_activities_opportunity_created_idx').on(
      table.opportunityId,
      table.createdAt,
    ),
    index('opportunity_activities_workspace_created_idx').on(
      table.workspaceId,
      table.createdAt,
    ),
  ],
);

export const opportunityStageHistory = pgTable(
  'opportunity_stage_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    opportunityId: uuid('opportunity_id')
      .notNull()
      .references(() => opportunities.id, { onDelete: 'cascade' }),
    fromStage: opportunityStage('from_stage'),
    toStage: opportunityStage('to_stage').notNull(),
    note: text('note'),
    changedByUserId: uuid('changed_by_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('opportunity_stage_history_opportunity_created_idx').on(
      table.opportunityId,
      table.createdAt,
    ),
    index('opportunity_stage_history_workspace_created_idx').on(
      table.workspaceId,
      table.createdAt,
    ),
  ],
);
