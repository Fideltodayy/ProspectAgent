import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { postReply } from '@/lib/twitter-poster';

const reviewSchema = z.object({
  prospectId: z.string(),
  action: z.enum(['approve', 'edit', 'skip']),
  editedReply: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { prospectId, action, editedReply } = reviewSchema.parse(await req.json());

    const prospect = await db.prospect.findFirst({
      where: { id: prospectId, company: { userId: user.id } },
    });

    if (!prospect) {
      return NextResponse.json({ error: { message: 'Prospect not found' } }, { status: 404 });
    }

    if (action === 'skip') {
      await db.prospect.update({
        where: { id: prospectId },
        data: { status: 'SKIPPED' },
      });
      return NextResponse.json({ data: { status: 'skipped' } });
    }

    const replyText = action === 'edit' && editedReply ? editedReply : prospect.suggestedReply;
    const status = action === 'edit' ? 'EDITED' : 'APPROVED';

    // Post the reply to Twitter
    await postReply(replyText, prospect.externalId);

    await db.prospect.update({
      where: { id: prospectId },
      data: {
        status: 'POSTED',
        finalReply: replyText,
        postedAt: new Date(),
      },
    });

    return NextResponse.json({ data: { status: 'posted', action: status } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: { message: 'Invalid input' } }, { status: 400 });
    }
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
    }
    console.error('[api/prospects/review] POST error:', err);
    return NextResponse.json({ error: { message: 'Internal error' } }, { status: 500 });
  }
}
