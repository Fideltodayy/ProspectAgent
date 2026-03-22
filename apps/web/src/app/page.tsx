import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect('/dashboard');

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-5xl font-bold tracking-tight">
          Your customers are already talking.
          <br />
          <span className="text-indigo-400">Start listening.</span>
        </h1>
        <p className="text-xl text-gray-400">
          ProspectAgent monitors Twitter in real time, detects buying signals, and drafts
          replies on your behalf — so you never miss a warm lead.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/sign-up"
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition-colors"
          >
            Start free trial
          </Link>
          <Link
            href="/sign-in"
            className="px-8 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
          >
            Sign in
          </Link>
        </div>
        <p className="text-sm text-gray-500">1-day free trial. No credit card required to start.</p>
      </div>
    </main>
  );
}
