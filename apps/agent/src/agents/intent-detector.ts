import Anthropic from '@anthropic-ai/sdk';
import { CompanyProfile, IntentAnalysis } from '@prospect-agent/shared';
import { config } from '../config';

const client = new Anthropic({ apiKey: config.anthropic.apiKey });

const SYSTEM_PROMPT = `You are an expert sales signal analyst. Your job is to determine whether a social media post represents a genuine buying signal for a specific product.

Analyze posts with deep context about who the company is, what they sell, and who their ideal customer is. Be precise and avoid false positives — it is better to miss a weak signal than to surface noise.

Respond ONLY with valid JSON matching the schema below. No other text.`;

function buildPrompt(tweet: string, author: string, profile: CompanyProfile): string {
  return `Analyze this tweet for buying intent relevant to the following company.

## Company Context
Product: ${profile.productDescription}
Ideal Customer: ${profile.idealCustomerProfile}
Monitoring Keywords: ${profile.keywords.join(', ')}
Competitor Names: ${profile.competitorNames.length > 0 ? profile.competitorNames.join(', ') : 'None specified'}

## Tweet
Author: @${author}
Content: ${tweet}

## Task
Determine if this tweet is a genuine buying signal. A genuine signal is one where the person has a real, expressed need that matches what this product solves, the timing is right (actively looking, frustrated, or comparing options), and engaging would feel helpful — not spammy.

Respond with this exact JSON:
{
  "isSignal": boolean,
  "score": number between 0.0 and 1.0,
  "reason": "one sentence explaining your determination",
  "signalType": "direct_need" | "pain_point" | "competitor_mention" | "question" | "not_a_signal"
}`;
}

export async function detectIntent(
  tweetContent: string,
  authorHandle: string,
  profile: CompanyProfile
): Promise<IntentAnalysis> {
  const response = await client.messages.create({
    model: config.anthropic.model,
    max_tokens: 256,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildPrompt(tweetContent, authorHandle, profile) }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    return JSON.parse(text) as IntentAnalysis;
  } catch {
    return { isSignal: false, score: 0, reason: 'Parse error', signalType: 'not_a_signal' };
  }
}
