import { notFound } from 'next/navigation';
import LeadDetailView from '@/components/workspace/leads/LeadDetailView';
import { requirePermissionPage } from '@/lib/auth/authorization';
import { hasPermission } from '@/lib/auth/permissions';
import { getLead } from '@/lib/leads/service';
import { isUuid } from '@/lib/leads/validation';
import { listMembers } from '@/lib/workspace/service';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Lead',
};

export default async function LeadDetailPage({ params }) {
  const viewer = await requirePermissionPage('leads.view');
  const { leadId } = await params;
  if (!isUuid(leadId)) notFound();

  const workspaceId = viewer.membership.workspaceId;
  const role = viewer.membership.role;

  const detail = await getLead(workspaceId, leadId);
  if (!detail) notFound();

  const canAssign = hasPermission(role, 'leads.assign');
  const members = canAssign ? await listMembers(workspaceId) : [];

  return (
    <LeadDetailView
      detail={detail}
      members={members}
      canUpdate={hasPermission(role, 'leads.update')}
      canAssign={canAssign}
      canArchive={hasPermission(role, 'leads.archive')}
      canCreateResearch={hasPermission(role, 'research.create')}
      canViewOpportunities={hasPermission(role, 'opportunities.view')}
      canCreateOpportunities={hasPermission(role, 'opportunities.create')}
      timezone={viewer.workspace.timezone || 'UTC'}
    />
  );
}
