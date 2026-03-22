import { redirect } from 'next/navigation';
import { getDbUser } from '@/lib/auth';
import SubscribeWithCrypto from '@/components/subscribe-with-crypto';

export default async function SubscribePage() {
  const user = await getDbUser();
  if (!user) redirect('/sign-in');

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold">Choose your plan</h1>
          <p className="text-gray-400 mt-2">
            Pay with USDC on Base — transparent, on-chain, no middlemen.
          </p>
        </div>
        <SubscribeWithCrypto />
        <p className="text-center text-xs text-gray-600 mt-8">
          Subscriptions managed by smart contract on Base L2.{' '}
          <a
            href={`https://basescan.org/address/${process.env.NEXT_PUBLIC_SUBSCRIPTION_CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-400"
          >
            View contract
          </a>
        </p>
      </div>
    </div>
  );
}
