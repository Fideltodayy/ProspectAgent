// ABI for ProspectAgentSubscription.sol
export const SUBSCRIPTION_ABI = [
  {
    name: 'startTrial',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'subscribe',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'plan', type: 'uint8' }],
    outputs: [],
  },
  {
    name: 'renew',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'cancel',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'hasAccess',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'subscriber', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'getSubscription',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'subscriber', type: 'address' }],
    outputs: [
      { name: 'plan', type: 'uint8' },
      { name: 'paidUntil', type: 'uint256' },
      { name: 'startedAt', type: 'uint256' },
      { name: 'renewalCount', type: 'uint256' },
      { name: 'active', type: 'bool' },
    ],
  },
  {
    name: 'planPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'plan', type: 'uint8' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'trialUsed',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  // Events
  {
    name: 'TrialStarted',
    type: 'event',
    inputs: [
      { name: 'subscriber', type: 'address', indexed: true },
      { name: 'expiresAt', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'Subscribed',
    type: 'event',
    inputs: [
      { name: 'subscriber', type: 'address', indexed: true },
      { name: 'plan', type: 'uint8', indexed: false },
      { name: 'paidUntil', type: 'uint256', indexed: false },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
] as const;

// Standard ERC-20 ABI (approve only — needed before subscribe)
export const ERC20_APPROVE_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;
