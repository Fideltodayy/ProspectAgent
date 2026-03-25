import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { scheduleMonitoringJob } from '@/lib/agent-queue';

export async function POST() {
  try {
    const user = await requireAuth();

    const company = await db.company.findUnique({ where: { userId: user.id } });
    if (!company) {
      return NextResponse.json({ error: { message: 'No company profile found' } }, { status: 404 });
    }

    await scheduleMonitoringJob(company);

    return NextResponse.json({ data: { message: 'Scan queued' } });
  } catch (err) {
    if (err instanceof Error && err.message === 'Unauthorized') {
      return NextResponse.json({ error: { message: 'Unauthorized' } }, { status: 401 });
    }
    console.error('[api/company/scan] POST error:', err);
    return NextResponse.json({ error: { message: 'Internal error' } }, { status: 500 });
  }
}
