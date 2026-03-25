'use client';

import { useState } from 'react';

interface Props {
  variant?: 'default' | 'prominent';
}

export default function ScanButton({ variant = 'default' }: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');

  async function runScan() {
    setState('loading');
    await fetch('/api/company/scan', { method: 'POST' });
    setState('done');
    // Reset after 3s and reload to show new prospects
    setTimeout(() => {
      setState('idle');
      window.location.reload();
    }, 3000);
  }

  const label = state === 'loading' ? 'Scanning...' : state === 'done' ? 'Scan queued ✓' : 'Run scan';

  if (variant === 'prominent') {
    return (
      <button
        onClick={runScan}
        disabled={state !== 'idle'}
        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 rounded-lg text-sm font-semibold transition-colors"
      >
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={runScan}
      disabled={state !== 'idle'}
      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-60 rounded-lg text-sm transition-colors"
    >
      {label}
    </button>
  );
}
