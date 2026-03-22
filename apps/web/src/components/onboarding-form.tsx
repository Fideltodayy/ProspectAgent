'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  userId: string;
}

export default function OnboardingForm({ userId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(e.currentTarget);

    const body = {
      name: form.get('name') as string,
      productDescription: form.get('productDescription') as string,
      idealCustomerProfile: form.get('idealCustomerProfile') as string,
      toneOfVoice: form.get('toneOfVoice') as string,
      keywords: (form.get('keywords') as string).split(',').map((k) => k.trim()).filter(Boolean),
      competitorNames: (form.get('competitorNames') as string)
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
      twitterHandle: (form.get('twitterHandle') as string) || undefined,
    };

    const res = await fetch('/api/company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.message ?? 'Something went wrong');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Field label="Company name" name="name" placeholder="Acme Inc." required />
      <TextareaField
        label="What does your product do?"
        name="productDescription"
        placeholder="We help e-commerce brands automate their customer support with AI..."
        required
        rows={3}
      />
      <TextareaField
        label="Who is your ideal customer?"
        name="idealCustomerProfile"
        placeholder="Founders and marketing leads at DTC e-commerce brands doing $1M-$10M ARR..."
        required
        rows={3}
      />
      <Field
        label="Tone of voice"
        name="toneOfVoice"
        placeholder="Friendly and direct, like talking to a knowledgeable friend"
        required
      />
      <Field
        label="Monitoring keywords (comma-separated)"
        name="keywords"
        placeholder="customer support automation, ai chatbot, reduce support tickets"
        required
      />
      <Field
        label="Competitor names (comma-separated, optional)"
        name="competitorNames"
        placeholder="Intercom, Zendesk, Freshdesk"
      />
      <Field
        label="Your Twitter handle (optional)"
        name="twitterHandle"
        placeholder="acmeinc"
      />

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg font-semibold transition-colors"
      >
        {loading ? 'Saving...' : 'Save profile and start finding prospects'}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <input
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
      />
    </div>
  );
}

function TextareaField({
  label,
  name,
  placeholder,
  required,
  rows = 3,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <textarea
        name={name}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none"
      />
    </div>
  );
}
