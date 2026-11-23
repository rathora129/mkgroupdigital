import {
  Activity,
  BadgeCheck,
  BookOpen,
  Bot,
  FolderKanban,
  Globe2,
  Layers,
  LayoutDashboard,
  ListChecks,
  ScrollText,
  Search,
  Settings,
  Target,
  Users,
  Wallet,
} from 'lucide-react';

export const workspaceNav = [
  {
    key: 'overview',
    label: 'Overview',
    href: '/workspace',
    icon: LayoutDashboard,
    description: 'A summary of the workspace and its connected modules.',
    features: [],
  },
  {
    key: 'ai-workforce',
    label: 'AI Workforce',
    href: '/workspace/ai-workforce',
    icon: Bot,
    permission: 'agents.view',
    description:
      'Configure agent roles, provider, model, monthly limits and approval gates. Provider calls run in the background worker.',
    features: [
      'Twelve workforce agent roles',
      'Provider, model and guardrails',
      'Agent and workspace budget limits',
      'Human approval gates',
    ],
  },
  {
    key: 'ai-runs',
    label: 'Agent runs',
    href: '/workspace/ai-workforce/runs',
    icon: Activity,
    permission: 'agents.view',
    description:
      'Every agent run with its status, recorded token usage, estimated cost, execution logs and safe cancellation.',
    features: [
      'Queued, running and finished runs',
      'Input and output records',
      'Token usage and cost estimates',
      'Execution logs and retries',
    ],
  },
  {
    key: 'leads',
    label: 'Leads',
    href: '/workspace/leads',
    icon: Users,
    permission: 'leads.view',
    description:
      'A workspace-scoped lead pipeline with owners, priorities, follow-ups, notes, duplicate review and a full activity history.',
    features: [
      'Pipeline from New to Won or Lost',
      'Search, filters and sorting',
      'Follow-up dates and overdue tracking',
      'Notes, activity and status history',
      'Safe duplicate review without automatic merging',
    ],
  },
  {
    key: 'opportunities',
    label: 'Opportunities',
    href: '/workspace/opportunities',
    icon: Target,
    permission: 'opportunities.view',
    description:
      'A workspace-scoped sales pipeline that extends leads with stages, expected value, owners, follow-ups and structured discovery.',
    features: [
      'Several opportunities per lead',
      'Controlled stage workflow with lost reasons',
      'Structured discovery and service requirements',
      'Requirement document generated from saved records',
      'Pipeline value kept separate from received revenue',
    ],
  },
  {
    key: 'services',
    label: 'Service catalogue',
    href: '/workspace/services',
    icon: Layers,
    permission: 'services.view',
    description:
      'One configurable catalogue of service categories and services, including explicit professional review for regulated work.',
    features: [
      'Five starter categories with 29 services',
      'No pricing stored in the catalogue',
      'Regulated services name the responsible professional',
      'Archive without deleting history',
    ],
  },
  {
    key: 'research',
    label: 'Business research',
    href: '/workspace/research',
    icon: Search,
    permission: 'research.view',
    description:
      'Evidence-based research briefs for a company, website, industry or CRM lead, with labelled verification and stored source references.',
    features: [
      'Company, website, industry and lead research',
      'Findings labelled by verification level',
      'Stored source references',
      'Background execution through the AI worker',
    ],
  },
  {
    key: 'audits',
    label: 'Website audits',
    href: '/workspace/website-audits',
    icon: Globe2,
    permission: 'audits.view',
    description:
      'Bounded, SSRF-safe website audits that report technical SEO, on-page SEO, performance signals, structured data, accessibility and security findings.',
    features: [
      'Submit a public website',
      'Robots-aware, page-limited crawl',
      'Findings with evidence and fixes',
      'Historical score comparison',
      'Cancel an open audit safely',
    ],
  },
  {
    key: 'approvals',
    label: 'Approvals',
    href: '/workspace/approvals',
    icon: BadgeCheck,
    permission: 'approvals.review',
    description:
      'Runs marked as sensitive wait here for a human decision. Approving queues the run; rejecting cancels it.',
    features: [
      'Pending review queue',
      'Approve or reject with a note',
      'Decision history',
      'Full audit trail',
    ],
  },
  {
    key: 'audit-log',
    label: 'Audit log',
    href: '/workspace/audit',
    icon: ScrollText,
    permission: 'audit.view',
    description:
      'A workspace-scoped record of sign-ins, invitations, membership changes, lead activity and other sensitive actions.',
    features: [
      'Filter by action, actor, resource and outcome',
      'Paginated event history',
      'Actor attribution',
      'Sensitive values removed',
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    href: '/workspace/settings',
    icon: Settings,
    description:
      'Workspace profile, team access, invitations and notification preferences.',
    features: [
      'Workspace profile',
      'Team access',
      'Notification preferences',
      'Audit history',
    ],
  },
  {
    key: 'tasks',
    label: 'Tasks',
    href: '/workspace/tasks',
    icon: ListChecks,
    description:
      'Task creation and assignment for the team and AI workforce will be added in a later phase.',
    features: [
      'Create and assign tasks',
      'Status and priority tracking',
      'Links to projects and clients',
      'Activity timeline',
    ],
  },
  {
    key: 'projects',
    label: 'Projects',
    href: '/workspace/projects',
    icon: FolderKanban,
    description:
      'Project delivery tracking will be introduced once project data is connected.',
    features: [
      'Project setup and milestones',
      'Deliverables and owners',
      'Progress updates',
      'Delivery history',
    ],
  },
  {
    key: 'finance',
    label: 'Finance',
    href: '/workspace/finance',
    icon: Wallet,
    description:
      'Invoices, expenses and revenue summaries are planned for a later phase.',
    features: [
      'Invoices and payment status',
      'Expense tracking',
      'Revenue summaries',
      'Export for accounting',
    ],
  },
  {
    key: 'memory',
    label: 'Memory & Knowledge',
    href: '/workspace/memory',
    icon: BookOpen,
    description:
      'Shared workspace knowledge and context for the AI workforce will live here.',
    features: [
      'Knowledge entries',
      'Document references',
      'Search across workspace memory',
      'Source attribution',
    ],
  },
];

export const workspaceSections = Object.fromEntries(
  workspaceNav.map((item) => [item.key, item]),
);
