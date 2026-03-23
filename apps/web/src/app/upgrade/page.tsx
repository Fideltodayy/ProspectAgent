import Link from 'next/link';

export default function UpgradePage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Your trial has ended</h1>
          <p className="text-gray-400 mt-3">
            Upgrade to keep finding prospects. Cancel any time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-3">
            <p className="text-sm text-gray-400 uppercase tracking-wide font-medium">Starter</p>
            <p className="text-3xl font-bold">$99<span className="text-lg text-gray-400">/mo</span></p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ 50 prospects / month</li>
              <li>✓ Twitter monitoring</li>
              <li>✓ AI reply drafts</li>
              <li>✓ Human review queue</li>
            </ul>
            <Link
              href="/subscribe"
              className="block text-center py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold text-sm transition-colors"
            >
              Get Starter
            </Link>
          </div>

          <div className="bg-gray-900 border border-indigo-500 rounded-xl p-6 space-y-3 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-xs font-bold px-3 py-1 rounded-full">
              POPULAR
            </span>
            <p className="text-sm text-gray-400 uppercase tracking-wide font-medium">Growth</p>
            <p className="text-3xl font-bold">$299<span className="text-lg text-gray-400">/mo</span></p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ 200 prospects / month</li>
              <li>✓ Twitter + Reddit</li>
              <li>✓ AI reply drafts</li>
              <li>✓ Analytics dashboard</li>
            </ul>
            <Link
              href="/subscribe"
              className="block text-center py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold text-sm transition-colors"
            >
              Get Growth
            </Link>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Pay with USDC on Base or credit card. No contracts.
        </p>
      </div>
    </main>
  );
}
