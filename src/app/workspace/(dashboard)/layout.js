import { redirect } from 'next/navigation';
import WorkspaceShell from '@/components/workspace/WorkspaceShell';
import { getViewer } from '@/lib/auth/authorization';
import { permissionsFor } from '@/lib/auth/permissions';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }) {
  const viewer = await getViewer();

  if (viewer.status !== 'ok') {
    redirect('/workspace/login');
  }

  return (
    <WorkspaceShell
      user={{
        id: viewer.user.id,
        name: viewer.user.name || null,
        email: viewer.user.email || null,
      }}
      workspace={{
        id: viewer.workspace.id,
        name: viewer.workspace.name,
        role: viewer.membership.role,
      }}
      permissions={permissionsFor(viewer.membership.role)}
    >
      {children}
    </WorkspaceShell>
  );
}
