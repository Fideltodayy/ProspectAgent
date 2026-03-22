import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// This route is called by the agent service — not by the browser.
// Protected by a shared secret, not Clerk auth.

const prospectSchema = z.object({
  companyId: z.string(),
  tweetId: z.string(),
  tweetContent: z.string(),
  authorHandle: z.string(),
  authorDisplayName: z.string(),
  url: z.string().url(),
  intentScore: z.number().min(0).max(1),
  intentReason: z.string(),
  signalType: z.string(),
  suggestedReply: z.string(),
  replyConfidence: z.number().min(0).max(1),
  replyNotes: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-agent-secret');
  if (secret !== process.env.AGENT_API_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = prospectSchema.parse(await req.json());

    // Upsert to avoid duplicates if the agent runs overlapping jobs
    const prospect = await db.prospect.upsert({
      where: { companyId_externalId: { companyId: body.companyId, externalId: body.tweetId } },
      update: {}, // don't overwrite if already exists
      create: {
        companyId: body.companyId,
        externalId: body.tweetId,
        platform: 'twitter',
        authorHandle: body.authorHandle,
        authorDisplayName: body.authorDisplayName,
        content: body.tweetContent,
        url: body.url,
        intentScore: body.intentScore,
        intentReason: body.intentReason,
        signalType: body.signalType,
        suggestedReply: body.suggestedReply,
        replyConfidence: body.replyConfidence,
        replyNotes: body.replyNotes ?? null,
        status: 'PENDING_REVIEW',
      },
    });

    return NextResponse.json({ data: { id: prospect.id } }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    console.error('[api/internal/prospects] error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
