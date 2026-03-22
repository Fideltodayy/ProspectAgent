import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { scheduleMonitoringJob } from '@/lib/agent-queue';

const createCompanySchema = z.object({
  name: z.string().min(1),
  productDescription: z.string().min(10),
  idealCustomerProfile: z.string().min(10),
  toneOfVoice: z.string().min(1),
  keywords: z.array(z.string()).min(1),
  competitorNames: z.array(z.string()).default([]),
  twitterHandle: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = createCompanySchema.parse(await req.json());

    const company = await db.company.create({
      data: { userId: user.id, ...body },
    });

    // Kick off the first monitoring run immediately
    await scheduleMonitoringJob(company);

    return NextResponse.json({ data: company }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: { message: 'Invalid input', code: 'VALIDATION' } }, { status: 400 });
    }
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
    }
    console.error('[api/company] POST error:', err);
    return NextResponse.json({ error: { message: 'Internal error' } }, { status: 500 });
  }
}
