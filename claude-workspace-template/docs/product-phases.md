# Product Phases

_Last updated: 2026-03-22_

---

## Overview

This document defines the phased build and go-to-market strategy. Each phase has a clear goal, feature set, success criteria, and gate before advancing to the next.

**Core principle:** Each phase must be validated before the next begins. Ship → measure → iterate.

---

## Phase 1 — MVP: Human-in-the-Loop (Current)

**Goal:** Prove the core value loop works. Find real prospects, draft real replies, convert at least one to a paying customer.

**Timeline:** Q1-Q2 2026

### Features

- [ ] Company profile onboarding (product description, ICP, tone of voice, keywords)
- [ ] Twitter/X keyword + semantic monitoring (search API)
- [ ] Claude-powered intent detection (classify tweets as buying signal vs noise)
- [ ] Claude-powered reply drafting (contextual, on-brand)
- [ ] Prospect review queue (approve / edit / skip)
- [ ] One-click post via Twitter API (human triggers the post)
- [ ] Basic analytics (prospects found, replies sent, engagement rate)
- [ ] 1-day free trial → paywall
- [ ] Stripe billing integration

### Pricing

| Tier    | Price  | Limits                          |
| ------- | ------ | ------------------------------- |
| Trial   | Free   | 1 day, up to 10 prospects shown |
| Starter | $99/mo | 50 engagements/mo, Twitter only |
| Growth  | $299/mo| 200 engagements/mo, Twitter + Reddit |

### Architecture

- `apps/web` — Next.js dashboard (profile setup, prospect queue, analytics)
- `apps/agent` — Node.js AI engine (monitoring, intent detection, reply generation)
- `packages/shared` — TypeScript types shared across apps
- PostgreSQL + Prisma for persistence
- BullMQ + Redis for background monitoring jobs

### Success Criteria (gate to Phase 2)

- End-to-end flow works: profile → signal detected → reply drafted → posted
- 10 paying beta customers
- Trial-to-paid conversion >20%
- Beta customers report ≥1 genuine prospect/day
- Zero platform bans

---

## Phase 2 — Expand Signals + Semi-Automation

**Goal:** Reduce human effort, expand to more platforms, add conversion tracking.

**Timeline:** Q3 2026 (after Phase 1 gate is met)

### Features

- [ ] Reddit monitoring (subreddit + keyword search)
- [ ] LinkedIn signal detection (mentions, posts — within API limits)
- [ ] Confidence scoring — high-confidence replies auto-post, low-confidence go to review queue
- [ ] Configurable automation threshold per company
- [ ] Conversion tracking — link engagements to signups/sales (UTM + webhook)
- [ ] Email digest — daily summary of prospects found + outcomes
- [ ] Competitor mention monitoring ("I'm looking for an alternative to X")
- [ ] Multi-seat team accounts (sales team reviews queue together)

### Pricing

| Tier    | Price   | Limits                                        |
| ------- | ------- | --------------------------------------------- |
| Starter | $99/mo  | 50 engagements/mo, Twitter only, full manual  |
| Growth  | $299/mo | 200 engagements/mo, 3 platforms, semi-auto    |
| Pro     | $799/mo | Unlimited engagements, all platforms, semi-auto, CRM sync |

### Success Criteria (gate to Phase 3)

- Semi-automation running without ToS violations
- 50+ paying customers
- Net revenue retention >100% (customers upgrading)
- Conversion tracking showing measurable ROI for customers

---

## Phase 3 — Full Automation + Enterprise

**Goal:** Become the default AI sales prospecting tool for SMBs and agencies.

**Timeline:** Q4 2026+

### Features

- [ ] Full autonomous mode (opt-in per company, with safety guardrails)
- [ ] CRM integrations (HubSpot, Salesforce, Pipedrive)
- [ ] Slack/Discord community monitoring
- [ ] Partner and investor discovery mode (separate from customer prospecting)
- [ ] Personalization engine (learns what works per company over time)
- [ ] White-label for agencies (agencies resell to their clients)
- [ ] API access (companies build their own workflows on top)
- [ ] Custom model fine-tuning per brand voice (enterprise tier)

### Pricing

- Pro: $799/mo (as above)
- Enterprise: Custom (white-label, API, dedicated support)
- Agency: Custom (multi-client management, reseller margin)

### Success Criteria

- 200+ paying customers
- Agency channel contributing >30% of new MRR
- Enterprise contracts signed
- Churn <5%/month

---

## Platform Expansion Roadmap

| Platform        | Phase | Notes                                                  |
| --------------- | ----- | ------------------------------------------------------ |
| Twitter/X       | 1     | Primary. API expensive but critical signal source.     |
| Reddit          | 2     | Strong buying intent signals. API more permissive.     |
| LinkedIn        | 2     | High-value B2B. API very restrictive — tread carefully.|
| Discord         | 3     | Community-specific. Requires invite per server.        |
| Slack communities | 3  | Same as Discord. High intent in niche communities.    |
| Product Hunt    | 3     | Launch day and comment signals.                        |
| Hacker News     | 2-3   | "Ask HN" posts, Show HN comments — high intent.       |

---

## Risk Register

| Risk                          | Severity | Phase | Mitigation                                                      |
| ----------------------------- | -------- | ----- | --------------------------------------------------------------- |
| Twitter API cost spike        | High     | 1     | Monitor usage tightly. Pass cost to Pro+ tiers if needed.      |
| Platform ban (ToS violation)  | High     | 1     | Human-in-the-loop keeps us compliant. Never auto-post in P1.   |
| AI reply feels robotic/spammy | High     | 1     | Human review + editing before post. Quality > quantity.         |
| Competitors copy the model    | Medium   | 2     | Speed and brand trust are the moat. Ship fast, collect reviews. |
| Low trial-to-paid conversion  | Medium   | 1     | Nail the onboarding "aha moment." Show prospects in <1 hour.    |
| Twitter API deprecation       | Medium   | 2+    | Multi-platform strategy reduces single-platform dependency.     |

---

## Notes

- This document is the source of truth for product direction. Update it as phases complete or strategy shifts.
- Feature flags should be used to gate Phase 2/3 features in the codebase — ship the code, control the rollout.
- Pricing is draft and should be adjusted based on customer willingness-to-pay conversations during beta.
