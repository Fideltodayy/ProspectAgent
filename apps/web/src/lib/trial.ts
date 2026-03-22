import { db } from './db';

const TRIAL_DURATION_HOURS = 24;

export async function startTrial(userId: string) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + TRIAL_DURATION_HOURS);

  return db.trial.upsert({
    where: { userId },
    update: {},
    create: { userId, expiresAt },
  });
}

export async function getTrialStatus(userId: string) {
  const trial = await db.trial.findUnique({ where: { userId } });
  if (!trial) return { active: false, expired: false, started: false };

  const now = new Date();
  return {
    started: true,
    active: now < trial.expiresAt,
    expired: now >= trial.expiresAt,
    expiresAt: trial.expiresAt,
  };
}

export async function hasActiveAccess(userId: string): Promise<boolean> {
  // Check active subscription
  const sub = await db.subscription.findUnique({ where: { userId } });
  if (sub && (sub.status === 'ACTIVE' || sub.status === 'TRIALING')) return true;

  // Check 1-day trial
  const trial = await getTrialStatus(userId);
  return trial.active;
}
