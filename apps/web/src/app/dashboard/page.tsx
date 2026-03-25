import { redirect } from 'next/navigation';
import { getDbUser } from '@/lib/auth';
import { hasActiveAccess } from '@/lib/trial';
import { db } from '@/lib/db';
import ProspectQueue from '@/components/prospect-queue';
import ScanButton from '@/components/scan-button';

export default async function DashboardPage() {
  const user = await getDbUser();
  if (!user) redirect('/sign-in');

  const access = await hasActiveAccess(user.id);
  if (!access) redirect('/upgrade');

  const company = await db.company.findUnique({ where: { userId: user.id } });
  if (!company) redirect('/onboarding');

  const [prospects, totalFound, totalPosted] = await Promise.all([
    db.prospect.findMany({
      where: { companyId: company.id, status: 'PENDING_REVIEW' },
      orderBy: [{ intentScore: 'desc' }, { detectedAt: 'desc' }],
      take: 50,
    }),
    db.prospect.count({ where: { companyId: company.id } }),
    db.prospect.count({ where: { companyId: company.id, status: 'POSTED' } }),
  ]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">ProspectAgent</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{company.name}</span>
          <ScanButton />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-indigo-400">{prospects.length}</p>
            <p className="text-xs text-gray-500 mt-1">Awaiting review</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold">{totalFound}</p>
            <p className="text-xs text-gray-500 mt-1">Total found</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{totalPosted}</p>
            <p className="text-xs text-gray-500 mt-1">Replies posted</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold">Prospect Queue</h2>
          <p className="text-gray-400 mt-1">
            {prospects.length > 0
              ? `${prospects.length} prospects waiting — approve, edit, or skip.`
              : 'No new prospects yet. Run a scan or wait for the next automatic check.'}
          </p>
        </div>

        {prospects.length === 0 ? (
          <div className="text-center py-24 text-gray-500 border border-dashed border-gray-800 rounded-xl">
            <p className="text-lg">Queue is empty</p>
            <p className="text-sm mt-2 mb-6">
              The agent scans Twitter every 5 minutes. Hit "Run scan" to check right now.
            </p>
            <ScanButton variant="prominent" />
          </div>
        ) : (
          <ProspectQueue prospects={prospects} />
        )}
      </main>
    </div>
  );
}
