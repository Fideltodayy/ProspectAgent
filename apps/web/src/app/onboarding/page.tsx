import { redirect } from 'next/navigation';
import { getDbUser } from '@/lib/auth';
import { startTrial } from '@/lib/trial';
import { db } from '@/lib/db';
import OnboardingForm from '@/components/onboarding-form';

export default async function OnboardingPage() {
  const user = await getDbUser();
  if (!user) redirect('/sign-in');

  // If company already exists, go to dashboard
  const company = await db.company.findUnique({ where: { userId: user.id } });
  if (company) redirect('/dashboard');

  // Start 1-day trial on first onboarding visit
  await startTrial(user.id);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-start justify-center px-4 py-16">
      <div className="max-w-2xl w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Set up your company profile</h1>
          <p className="text-gray-400 mt-2">
            This is how the agent knows who you are, what you sell, and who to find.
            Takes about 5 minutes.
          </p>
        </div>
        <OnboardingForm userId={user.id} />
      </div>
    </div>
  );
}
