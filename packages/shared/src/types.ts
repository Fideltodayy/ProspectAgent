// ─── Company Profile ──────────────────────────────────────────────────────────

export interface CompanyProfile {
  id: string;
  userId: string;
  name: string;
  productDescription: string;
  idealCustomerProfile: string; // who they sell to
  toneOfVoice: string; // e.g. "professional", "casual and friendly", "direct"
  keywords: string[]; // monitoring keywords
  competitorNames: string[]; // detect "looking for alternative to X"
  twitterHandle?: string; // the brand's Twitter account
  createdAt: Date;
  updatedAt: Date;
}

// ─── Prospect (a social signal / tweet detected) ──────────────────────────────

export type Platform = 'twitter' | 'reddit' | 'linkedin' | 'discord';

export type ProspectStatus =
  | 'pending_review' // in queue, awaiting human decision
  | 'approved' // human approved the reply
  | 'edited' // human edited the reply before approving
  | 'posted' // reply was posted to the platform
  | 'skipped' // human skipped this prospect
  | 'auto_skipped'; // agent determined it's not worth surfacing

export interface Prospect {
  id: string;
  companyId: string;
  platform: Platform;
  externalId: string; // tweet ID, reddit post ID, etc.
  authorHandle: string;
  authorDisplayName: string;
  content: string; // the original post/tweet text
  url: string;
  detectedAt: Date;
  intentScore: number; // 0-1, confidence that this is a genuine buying signal
  intentReason: string; // Claude's explanation of why this is a signal
  suggestedReply: string; // Claude's drafted reply
  status: ProspectStatus;
  postedAt?: Date;
  finalReply?: string; // what was actually posted (may differ from suggestedReply)
}

// ─── Intent Detection ─────────────────────────────────────────────────────────

export interface IntentAnalysis {
  isSignal: boolean;
  score: number; // 0-1
  reason: string;
  signalType:
    | 'direct_need' // "looking for a tool that does X"
    | 'pain_point' // "I'm frustrated with Y"
    | 'competitor_mention' // "thinking of switching from Z"
    | 'question' // "does anyone know a good X?"
    | 'not_a_signal';
}

// ─── Reply Generation ─────────────────────────────────────────────────────────

export interface GeneratedReply {
  text: string;
  confidence: number; // 0-1, how well the reply fits the context
  notes?: string; // any caveats or suggestions for the human reviewer
}

// ─── Queue / Review ───────────────────────────────────────────────────────────

export interface ReviewAction {
  prospectId: string;
  action: 'approve' | 'edit' | 'skip';
  editedReply?: string; // if action is 'edit'
}

// ─── Job / Monitoring ─────────────────────────────────────────────────────────

export interface MonitoringJob {
  companyId: string;
  platform: Platform;
  keywords: string[];
  lastRunAt?: Date;
  nextRunAt: Date;
}

// ─── API Response Shapes ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  error?: never;
}

export interface ApiError {
  data?: never;
  error: {
    message: string;
    code?: string;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;
