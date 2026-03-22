import 'dotenv/config';

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
}

export const config = {
  anthropic: {
    apiKey: required('ANTHROPIC_API_KEY'),
    model: 'claude-sonnet-4-6',
  },
  twitter: {
    apiKey: required('TWITTER_API_KEY'),
    apiSecret: required('TWITTER_API_SECRET'),
    accessToken: required('TWITTER_ACCESS_TOKEN'),
    accessSecret: required('TWITTER_ACCESS_SECRET'),
    bearerToken: required('TWITTER_BEARER_TOKEN'),
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },
  database: {
    url: required('DATABASE_URL'),
  },
  agent: {
    // How often to run monitoring jobs (in seconds)
    monitoringIntervalSeconds: Number(process.env.MONITORING_INTERVAL_SECONDS ?? 300),
    // Minimum intent score to surface a prospect to the review queue
    minIntentScore: Number(process.env.MIN_INTENT_SCORE ?? 0.6),
    // Max prospects to fetch per keyword per run
    maxResultsPerKeyword: Number(process.env.MAX_RESULTS_PER_KEYWORD ?? 20),
  },
  web: {
    appUrl: process.env.WEB_APP_URL ?? 'http://localhost:3000',
    apiSecret: required('AGENT_API_SECRET'),
  },
};
