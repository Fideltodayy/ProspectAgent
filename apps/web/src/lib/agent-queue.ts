import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import type { Company } from '@prisma/client';

// The web app schedules monitoring jobs into the same Redis queue
// that the agent service workers are listening to.

let _queue: Queue | null = null;

function getQueue() {
  if (!_queue) {
    const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
      maxRetriesPerRequest: null,
    });
    _queue = new Queue('monitoring', { connection });
  }
  return _queue;
}

export async function scheduleMonitoringJob(company: Company) {
  const queue = getQueue();
  await queue.add(
    'monitor',
    { companyId: company.id, profile: company },
    {
      jobId: `monitor-${company.id}-${Date.now()}`,
      attempts: 3,
      backoff: { type: 'exponential', delay: 10_000 },
    }
  );
}
