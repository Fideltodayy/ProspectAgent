import Anthropic from '@anthropic-ai/sdk';
import { CompanyProfile, GeneratedReply, IntentAnalysis } from '@prospect-agent/shared';
import { config } from '../config';

const client = new Anthropic({ apiKey: config.anthropic.apiKey });

const SYSTEM_PROMPT = `You are an expert social media copywriter who specializes in authentic, helpful outreach replies on behalf of brands.

Your replies must:
- Feel human, warm, and genuine — never salesy or spammy
- Directly address what the person said — show you actually read their post
- Mention the product naturally only if it is genuinely relevant
- Be concise (under 280 characters for Twitter unless context demands more)
- Match the brand's specified tone of voice exactly

Respond ONLY with valid JSON matching the schema below. No other text.`;

function buildPrompt(
  tweet: string,
  author: string,
  profile: CompanyProfile,
  intent: IntentAnalysis
): string {
  return `Write a reply to this tweet on behalf of the company below.

## Company Context
Company Name: ${profile.name}
Product: ${profile.productDescription}
Tone of Voice: ${profile.toneOfVoice}
Twitter Handle: ${profile.twitterHandle ?? 'not set'}

## Original Tweet
Author: @${author}
Content: ${tweet}

## Why This is a Signal
${intent.reason} (signal type: ${intent.signalType})

## Task
Write a reply that feels natural and helpful. Do not open with "Hey" or the person's name. Do not use exclamation marks excessively. If the product is relevant, mention it briefly — do not pitch aggressively. Leave room for conversation.

Respond with this exact JSON:
{
  "text": "the reply text here",
  "confidence": number between 0.0 and 1.0,
  "notes": "optional note for the human reviewer, or null"
}`;
}

export async function generateReply(
  tweetContent: string,
  authorHandle: string,
  profile: CompanyProfile,
  intent: IntentAnalysis
): Promise<GeneratedReply> {
  const response = await client.messages.create({
    model: config.anthropic.model,
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildPrompt(tweetContent, authorHandle, profile, intent) }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';

  try {
    return JSON.parse(text) as GeneratedReply;
  } catch {
    return {
      text: '',
      confidence: 0,
      notes: 'Failed to generate reply — review manually',
    };
  }
}
