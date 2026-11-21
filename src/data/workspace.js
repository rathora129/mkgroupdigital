import {
  BadgeCheck,
  BookOpen,
  Bot,
  FileText,
  FolderKanban,
  Globe2,
  LayoutDashboard,
  ListChecks,
  Settings,
  Users,
  Wallet,
} from 'lucide-react';

export const workspaceNav = [
  {
    key: 'overview',
    label: 'Overview',
    href: '/workspace',
    icon: LayoutDashboard,
    description: 'A summary of the workspace and what is available in Phase 1.',
    features: [],
  },
  {
    key: 'ai-workforce',
    label: 'AI Workforce',
    href: '/workspace/ai-workforce',
    icon: Bot,
    description:
      'Where AI agent roles, instructions and approvals will live. No agents are configured yet.',
    features: [
      'Agent roles and responsibilities',
      'Instructions and knowledge sources',
      'Run activity and history',
      'Human approval checkpoints',
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
    key: 'leads',
    label: 'Leads',
    href: '/workspace/leads',
    icon: Users,
    description:
      'Enquiry and lead management will connect here once the data layer is introduced.',
    features: [
      'Lead capture and source tracking',
      'Contact history',
      'Qualification notes',
      'Handoff to projects',
    ],
  },
  {
    key: 'audits',
    label: 'Website Audits',
    href: '/workspace/audits',
    icon: Globe2,
    description:
      'Structured website audits and recommendations will be available in a later phase.',
    features: [
      'Submit a website for review',
      'Structured audit findings',
      'Prioritised recommendations',
      'Export findings to a proposal',
    ],
  },
  {
    key: 'sales',
    label: 'Sales & Proposals',
    href: '/workspace/sales',
    icon: FileText,
    description:
      'Proposal drafting and sales follow-up will connect to real client records in a later phase.',
    features: [
      'Proposal drafts',
      'Scope and pricing line items',
      'Follow-up reminders',
      'Win and loss tracking',
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
  {
    key: 'approvals',
    label: 'Approvals',
    href: '/workspace/approvals',
    icon: BadgeCheck,
    description:
      'Review queues and human approval checkpoints will be added with the AI workforce.',
    features: [
      'Review queue',
      'Approve or reject requests',
      'Decision history',
      'Audit trail',
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    href: '/workspace/settings',
    icon: Settings,
    description:
      'Workspace configuration, access and preferences will be managed here.',
    features: [
      'Workspace profile',
      'Team access',
      'Notification preferences',
      'Integrations',
    ],
  },
];

export const workspaceSections = Object.fromEntries(
  workspaceNav.map((item) => [item.key, item]),
);

export const overviewStats = [
  { label: 'Tasks', key: 'tasks' },
  { label: 'Leads', key: 'leads' },
  { label: 'Website audits', key: 'audits' },
  { label: 'Projects', key: 'projects' },
];

export const quickActions = [
  { label: 'Open Tasks', key: 'tasks' },
  { label: 'Open Leads', key: 'leads' },
  { label: 'Open Website Audits', key: 'audits' },
  { label: 'Open Approvals', key: 'approvals' },
];
