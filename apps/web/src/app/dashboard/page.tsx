import { redirect } from 'next/navigation';
import { getDbUser } from '@/lib/auth';
import { hasActiveAccess } from '@/lib/trial';
import { db } from '@/lib/db';
import ProspectQueue from '@/components/prospect-queue';

export default async function DashboardPage() {
  const user = await getDbUser();
  if (!user) redirect('/sign-in');

  const access = await hasActiveAccess(user.id);
  if (!access) redirect('/upgrade');

  const company = await db.company.findUnique({ where: { userId: user.id } });
  if (!company) redirect('/onboarding');

  const prospects = await db.prospect.findMany({
    where: { companyId: company.id, status: 'PENDING_REVIEW' },
    orderBy: [{ intentScore: 'desc' }, { detectedAt: 'desc' }],
    take: 50,
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">ProspectAgent</h1>
        <span className="text-sm text-gray-400">{company.name}</span>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Prospect Queue</h2>
          <p className="text-gray-400 mt-1">
            {prospects.length} prospects waiting for review — approve, edit, or skip.
          </p>
        </div>

        {prospects.length === 0 ? (
          <div className="text-center py-24 text-gray-500">
            <p className="text-lg">No prospects yet.</p>
            <p className="text-sm mt-2">
              The agent is monitoring Twitter for buying signals matching your profile.
            </p>
          </div>
        ) : (
          <ProspectQueue prospects={prospects} />
        )}
      </main>
    </div>
  );
}
