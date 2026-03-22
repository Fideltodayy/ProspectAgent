import { TwitterApi } from 'twitter-api-v2';

// User-auth client for posting on behalf of the platform account.
// In Phase 2 this will be per-company OAuth tokens stored in the DB.
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_SECRET!,
});

export async function postReply(replyText: string, replyToTweetId: string): Promise<string> {
  const posted = await client.v2.tweet({
    text: replyText,
    reply: { in_reply_to_tweet_id: replyToTweetId },
  });
  return posted.data.id;
}
