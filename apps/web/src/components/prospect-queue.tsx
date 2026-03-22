'use client';

import { useState } from 'react';
import type { Prospect } from '@prisma/client';

interface Props {
  prospects: Prospect[];
}

export default function ProspectQueue({ prospects: initial }: Props) {
  const [prospects, setProspects] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedReply, setEditedReply] = useState('');
  const [loading, setLoading] = useState<string | null>(null);

  async function act(prospectId: string, action: 'approve' | 'edit' | 'skip', reply?: string) {
    setLoading(prospectId);
    await fetch('/api/prospects/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prospectId, action, editedReply: reply }),
    });
    setProspects((prev) => prev.filter((p) => p.id !== prospectId));
    setLoading(null);
    setEditingId(null);
  }

  return (
    <div className="space-y-4">
      {prospects.map((p) => (
        <div key={p.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          {/* Signal metadata */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-sm font-medium text-indigo-400">
                @{p.authorHandle}
              </span>
              <span className="text-xs text-gray-500 ml-2">
                Score: {(p.intentScore * 100).toFixed(0)}%
              </span>
            </div>
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-gray-300"
            >
              View tweet
            </a>
          </div>

          {/* Original tweet */}
          <p className="text-gray-300 text-sm leading-relaxed border-l-2 border-gray-700 pl-3">
            {p.content}
          </p>

          {/* Why it's a signal */}
          <p className="text-xs text-gray-500 italic">{p.intentReason}</p>

          {/* Suggested reply */}
          {editingId === p.id ? (
            <textarea
              value={editedReply}
              onChange={(e) => setEditedReply(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-gray-800 border border-indigo-500 rounded-lg text-sm text-white resize-none focus:outline-none"
            />
          ) : (
            <div className="bg-gray-800 rounded-lg px-4 py-3">
              <p className="text-xs text-gray-500 mb-1">Suggested reply</p>
              <p className="text-sm text-white">{p.suggestedReply}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {editingId === p.id ? (
              <>
                <button
                  onClick={() => act(p.id, 'edit', editedReply)}
                  disabled={loading === p.id}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Post edited reply
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => act(p.id, 'approve')}
                  disabled={loading === p.id}
                  className="px-4 py-1.5 bg-green-700 hover:bg-green-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {loading === p.id ? 'Posting...' : 'Approve & post'}
                </button>
                <button
                  onClick={() => {
                    setEditingId(p.id);
                    setEditedReply(p.suggestedReply);
                  }}
                  className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                >
                  Edit reply
                </button>
                <button
                  onClick={() => act(p.id, 'skip')}
                  disabled={loading === p.id}
                  className="px-4 py-1.5 text-gray-500 hover:text-gray-300 text-sm transition-colors"
                >
                  Skip
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
