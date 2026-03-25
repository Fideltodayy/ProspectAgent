import { Queue, Worker, Job } from 'bullmq';
import { CompanyProfile } from '@prospect-agent/shared';
import { config } from '../config';
import { searchTweets } from '../monitor/twitter-monitor';
import { detectIntent } from '../agents/intent-detector';
import { generateReply } from '../agents/reply-generator';

// Pass URL directly — BullMQ manages its own IORedis connection internally
const connection = { url: config.redis.url, maxRetriesPerRequest: null as null };

// Queue: one job per company monitoring run
export const monitoringQueue = new Queue('monitoring', { connection });

export interface MonitoringJobData {
  companyId: string;
  profile: CompanyProfile;
  sinceId?: string;
}

export interface DetectedProspect {
  companyId: string;
  tweetId: string;
  tweetContent: string;
  authorHandle: string;
  authorDisplayName: string;
  url: string;
  intentScore: number;
  intentReason: string;
  signalType: string;
  suggestedReply: string;
  replyConfidence: number;
  replyNotes?: string | null;
}

/**
 * Schedule a monitoring run for a company.
 * Call this when a company is created or on a recurring schedule.
 */
export async function scheduleMonitoringJob(
  profile: CompanyProfile,
  sinceId?: string
): Promise<void> {
  await monitoringQueue.add(
    'monitor',
    { companyId: profile.id, profile, sinceId } satisfies MonitoringJobData,
    {
      jobId: `monitor-${profile.id}-${Date.now()}`,
      attempts: 3,
      backoff: { type: 'exponential', delay: 10_000 },
    }
  );
}

/**
 * Start the worker that processes monitoring jobs.
 * This runs the full pipeline: search → intent → reply draft → send to web app queue.
 */
export function startMonitoringWorker(
  onProspectFound: (prospect: DetectedProspect) => Promise<void>
): Worker {
  const worker = new Worker<MonitoringJobData>(
    'monitoring',
    async (job: Job<MonitoringJobData>) => {
      const { profile, sinceId } = job.data;

      console.log(`[monitor] Running for company: ${profile.name} (${profile.id})`);

      const tweets = await searchTweets(profile, sinceId);
      console.log(`[monitor] Found ${tweets.length} tweets to analyze`);

      for (const tweet of tweets) {
        const intent = await detectIntent(tweet.text, tweet.authorHandle, profile);

        if (!intent.isSignal || intent.score < config.agent.minIntentScore) {
          console.log(`[monitor] Skipping tweet ${tweet.id} — score ${intent.score.toFixed(2)}`);
          continue;
        }

        console.log(`[monitor] Signal detected! tweet=${tweet.id} score=${intent.score.toFixed(2)}`);

        const reply = await generateReply(tweet.text, tweet.authorHandle, profile, intent);

        await onProspectFound({
          companyId: profile.id,
          tweetId: tweet.id,
          tweetContent: tweet.text,
          authorHandle: tweet.authorHandle,
          authorDisplayName: tweet.authorDisplayName,
          url: tweet.url,
          intentScore: intent.score,
          intentReason: intent.reason,
          signalType: intent.signalType,
          suggestedReply: reply.text,
          replyConfidence: reply.confidence,
          replyNotes: reply.notes,
        });
      }
    },
    { connection, concurrency: 2 }
  );

  worker.on('failed', (job, err) => {
    console.error(`[monitor] Job failed: ${job?.id}`, err);
  });

  return worker;
}
