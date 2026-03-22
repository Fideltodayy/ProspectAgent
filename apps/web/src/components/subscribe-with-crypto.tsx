'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseUnits } from 'viem';
import { SUBSCRIPTION_ABI, ERC20_APPROVE_ABI } from '@/lib/web3/subscription-abi';
import { SUBSCRIPTION_CONTRACT_ADDRESS, getUsdcAddress } from '@/lib/web3/config';

const PLANS = [
  { id: 1, name: 'Starter', price: '99', usdcAmount: parseUnits('99', 6), features: ['50 engagements/mo', 'Twitter monitoring', 'Review queue'] },
  { id: 2, name: 'Growth', price: '299', usdcAmount: parseUnits('299', 6), features: ['200 engagements/mo', 'Twitter + Reddit', 'Analytics', 'Semi-auto (coming soon)'] },
  { id: 3, name: 'Pro', price: '799', usdcAmount: parseUnits('799', 6), features: ['Unlimited engagements', 'All platforms', 'CRM sync', 'Priority support'] },
];

type Step = 'select' | 'approve' | 'subscribe' | 'done';

export default function SubscribeWithCrypto() {
  const { address, isConnected } = useAccount();
  const [selectedPlan, setSelectedPlan] = useState<(typeof PLANS)[0] | null>(null);
  const [step, setStep] = useState<Step>('select');

  const usdcAddress = getUsdcAddress();

  // Check current USDC allowance
  const { data: allowance } = useReadContract({
    address: usdcAddress,
    abi: ERC20_APPROVE_ABI,
    functionName: 'allowance',
    args: address ? [address, SUBSCRIPTION_CONTRACT_ADDRESS] : undefined,
    query: { enabled: !!address && !!selectedPlan },
  });

  // Check if trial already used
  const { data: trialUsed } = useReadContract({
    address: SUBSCRIPTION_CONTRACT_ADDRESS,
    abi: SUBSCRIPTION_ABI,
    functionName: 'trialUsed',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Approve USDC spend
  const { writeContract: approveUsdc, data: approveTxHash, isPending: approving } = useWriteContract();
  const { isLoading: waitingApproval, isSuccess: approved } = useWaitForTransactionReceipt({ hash: approveTxHash });

  // Subscribe
  const { writeContract: subscribe, data: subscribeTxHash, isPending: subscribing } = useWriteContract();
  const { isLoading: waitingSubscribe, isSuccess: subscribed } = useWaitForTransactionReceipt({ hash: subscribeTxHash });

  // Trial
  const { writeContract: startTrial, data: trialTxHash, isPending: startingTrial } = useWriteContract();
  const { isSuccess: trialStarted } = useWaitForTransactionReceipt({ hash: trialTxHash });

  function handleApprove() {
    if (!selectedPlan) return;
    approveUsdc({
      address: usdcAddress,
      abi: ERC20_APPROVE_ABI,
      functionName: 'approve',
      args: [SUBSCRIPTION_CONTRACT_ADDRESS, selectedPlan.usdcAmount],
    });
    setStep('approve');
  }

  function handleSubscribe() {
    if (!selectedPlan) return;
    subscribe({
      address: SUBSCRIPTION_CONTRACT_ADDRESS,
      abi: SUBSCRIPTION_ABI,
      functionName: 'subscribe',
      args: [selectedPlan.id],
    });
    setStep('subscribe');
  }

  function handleTrial() {
    startTrial({ address: SUBSCRIPTION_CONTRACT_ADDRESS, abi: SUBSCRIPTION_ABI, functionName: 'startTrial', args: [] });
  }

  const needsApproval = selectedPlan && allowance !== undefined && allowance < selectedPlan.usdcAmount;
  const isApproved = approved || (allowance !== undefined && selectedPlan && allowance >= selectedPlan.usdcAmount);

  if (subscribed || trialStarted) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="text-5xl">✓</div>
        <h2 className="text-2xl font-bold text-green-400">You're in.</h2>
        <p className="text-gray-400">Your on-chain subscription is active. The agent is now finding customers for you.</p>
        <a href="/dashboard" className="inline-block mt-4 px-6 py-2 bg-indigo-600 rounded-lg font-semibold">Go to dashboard</a>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="space-y-6 text-center">
        <p className="text-gray-400">Connect your wallet to subscribe with USDC on Base.</p>
        <div className="flex justify-center">
          <ConnectButton />
        </div>
        <p className="text-xs text-gray-600">Payments settled on Base L2 — fast, cheap, transparent.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Trial CTA */}
      {!trialUsed && (
        <div className="bg-indigo-950 border border-indigo-700 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-indigo-300">Start with a 1-day free trial</p>
            <p className="text-sm text-gray-400 mt-1">No USDC needed. One trial per wallet.</p>
          </div>
          <button
            onClick={handleTrial}
            disabled={startingTrial}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {startingTrial ? 'Starting...' : 'Start trial'}
          </button>
        </div>
      )}

      {/* Plan selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setSelectedPlan(plan)}
            className={`text-left p-5 rounded-xl border transition-all ${
              selectedPlan?.id === plan.id
                ? 'border-indigo-500 bg-indigo-950'
                : 'border-gray-700 bg-gray-900 hover:border-gray-600'
            }`}
          >
            <p className="font-bold text-lg">{plan.name}</p>
            <p className="text-2xl font-bold text-indigo-400 mt-1">${plan.price}<span className="text-sm text-gray-400 font-normal">/mo</span></p>
            <p className="text-xs text-gray-500 mt-1">paid in USDC on Base</p>
            <ul className="mt-4 space-y-1">
              {plan.features.map((f) => (
                <li key={f} className="text-sm text-gray-300">— {f}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {/* Payment action */}
      {selectedPlan && (
        <div className="space-y-3">
          {needsApproval && !isApproved ? (
            <button
              onClick={handleApprove}
              disabled={approving || waitingApproval}
              className="w-full py-3 bg-yellow-600 hover:bg-yellow-500 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {approving || waitingApproval ? 'Approving USDC...' : `Step 1: Approve ${selectedPlan.price} USDC`}
            </button>
          ) : null}

          <button
            onClick={handleSubscribe}
            disabled={!!needsApproval && !isApproved || subscribing || waitingSubscribe}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {subscribing || waitingSubscribe
              ? 'Confirming on Base...'
              : `${needsApproval && !isApproved ? 'Step 2: ' : ''}Subscribe — ${selectedPlan.price} USDC/mo`}
          </button>

          {subscribeTxHash && (
            <p className="text-xs text-center text-gray-500">
              Tx:{' '}
              <a
                href={`https://basescan.org/tx/${subscribeTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 underline"
              >
                view on Basescan
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
