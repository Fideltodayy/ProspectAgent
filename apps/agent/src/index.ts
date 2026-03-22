import 'dotenv/config';
import { startMonitoringWorker, DetectedProspect } from './queue/prospect-queue';
import { config } from './config';

console.log('[agent] Starting prospect agent service...');

/**
 * When a prospect is found, push it to the web app via internal API.
 * The web app persists it to the database and adds it to the review queue.
 */
async function handleProspectFound(prospect: DetectedProspect): Promise<void> {
  const url = `${config.web.appUrl}/api/internal/prospects`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-agent-secret': config.web.apiSecret,
    },
    body: JSON.stringify(prospect),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to push prospect to web app: ${response.status} ${body}`);
  }

  console.log(`[agent] Prospect pushed to review queue: @${prospect.authorHandle}`);
}

// Start the worker
const worker = startMonitoringWorker(handleProspectFound);

// Graceful shutdown
async function shutdown() {
  console.log('[agent] Shutting down...');
  await worker.close();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

console.log('[agent] Worker started. Waiting for monitoring jobs...');
