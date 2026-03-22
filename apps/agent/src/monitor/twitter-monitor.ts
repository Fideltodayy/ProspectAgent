import { TwitterApi } from 'twitter-api-v2';
import { CompanyProfile } from '@prospect-agent/shared';
import { config } from '../config';

// Read-only client for search (uses Bearer token — no user auth needed)
const readClient = new TwitterApi(config.twitter.bearerToken).readOnly;

// User-auth client for posting replies
export const writeClient = new TwitterApi({
  appKey: config.twitter.apiKey,
  appSecret: config.twitter.apiSecret,
  accessToken: config.twitter.accessToken,
  accessSecret: config.twitter.accessSecret,
});

export interface RawTweet {
  id: string;
  text: string;
  authorId: string;
  authorHandle: string;
  authorDisplayName: string;
  url: string;
  createdAt: Date;
}

/**
 * Search Twitter for recent tweets matching a company's monitoring keywords.
 * Filters out retweets and replies to reduce noise.
 */
export async function searchTweets(
  profile: CompanyProfile,
  sinceId?: string
): Promise<RawTweet[]> {
  const query = buildSearchQuery(profile);

  const searchParams: Parameters<typeof readClient.v2.search>[1] = {
    max_results: config.agent.maxResultsPerKeyword,
    'tweet.fields': ['created_at', 'author_id', 'text'],
    'user.fields': ['username', 'name'],
    expansions: ['author_id'],
    ...(sinceId ? { since_id: sinceId } : {}),
  };

  const response = await readClient.v2.search(query, searchParams);

  if (!response.data?.data) return [];

  const users = response.data.includes?.users ?? [];
  const userMap = new Map(users.map((u) => [u.id, u]));

  return response.data.data.map((tweet) => {
    const author = userMap.get(tweet.author_id ?? '');
    return {
      id: tweet.id,
      text: tweet.text,
      authorId: tweet.author_id ?? '',
      authorHandle: author?.username ?? 'unknown',
      authorDisplayName: author?.name ?? 'Unknown',
      url: `https://twitter.com/${author?.username}/status/${tweet.id}`,
      createdAt: tweet.created_at ? new Date(tweet.created_at) : new Date(),
    };
  });
}

/**
 * Post a reply tweet. Returns the ID of the posted tweet.
 */
export async function postReply(replyText: string, replyToTweetId: string): Promise<string> {
  const posted = await writeClient.v2.tweet({
    text: replyText,
    reply: { in_reply_to_tweet_id: replyToTweetId },
  });
  return posted.data.id;
}

/**
 * Build a Twitter search query from the company profile.
 * Filters out retweets and own brand mentions.
 */
function buildSearchQuery(profile: CompanyProfile): string {
  const keywordParts = profile.keywords.map((kw) =>
    kw.includes(' ') ? `"${kw}"` : kw
  );

  const competitorParts = profile.competitorNames.map(
    (name) => `"${name}" (alternative OR switch OR replace OR "looking for")`
  );

  const allSignals = [...keywordParts, ...competitorParts];
  const orQuery = allSignals.join(' OR ');

  // Exclude retweets, quotes of own brand, and replies to own handle
  const exclusions = [
    '-is:retweet',
    '-is:quote',
    'lang:en',
    ...(profile.twitterHandle ? [`-from:${profile.twitterHandle}`] : []),
  ].join(' ');

  return `(${orQuery}) ${exclusions}`;
}
