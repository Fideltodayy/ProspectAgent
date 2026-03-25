import { db } from './lib/db';
import { scheduleMonitoringJob } from './queue/prospect-queue';
import { config } from './config';

/**
 * Fetch every company from the database and enqueue a monitoring job for each.
 * Called on startup and then on the configured interval.
 */
async function runScheduledScans() {
  const companies = await db.company.findMany({
    include: { user: { include: { subscription: true, trial: true } } },
  });

  const now = new Date();
  let enqueued = 0;

  for (const company of companies) {
    const sub = company.user.subscription;
    const trial = company.user.trial;

    const hasActiveSub = sub && (sub.status === 'ACTIVE' || sub.status === 'TRIALING');
    const hasActiveTrial = trial && now < trial.expiresAt;

    if (!hasActiveSub && !hasActiveTrial) {
      console.log(`[scheduler] Skipping ${company.name} — no active access`);
      continue;
    }

    await scheduleMonitoringJob(company as any);
    enqueued++;
    console.log(`[scheduler] Enqueued scan for: ${company.name}`);
  }

  console.log(`[scheduler] Round complete — ${enqueued}/${companies.length} companies enqueued`);
}

/**
 * Start the recurring scheduler.
 * Fires immediately on start, then every MONITORING_INTERVAL_SECONDS.
 */
export function startScheduler() {
  const intervalMs = config.agent.monitoringIntervalSeconds * 1000;

  console.log(
    `[scheduler] Starting — interval: ${config.agent.monitoringIntervalSeconds}s`
  );

  // Fire immediately on startup
  runScheduledScans().catch((err) =>
    console.error('[scheduler] Initial scan failed:', err)
  );

  // Then repeat on interval
  const timer = setInterval(() => {
    runScheduledScans().catch((err) =>
      console.error('[scheduler] Scheduled scan failed:', err)
    );
  }, intervalMs);

  return timer;
}
