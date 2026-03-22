# Business Info

---

## Organization Overview

We are building a SaaS AI agent product that helps small and medium-sized businesses (SMBs) find and engage with their ideal customers in real time across social platforms — primarily Twitter/X, with Reddit and communities to follow.

The core value proposition: businesses stop guessing where their customers are. Our AI agent listens to social signals, detects genuine buying intent, and initiates contextual, human-sounding conversations on behalf of the brand — turning passive social noise into active pipeline.

## Products / Services / Focus Areas

- **AI Prospect Agent** — Monitors social platforms for buying signals matching the company's ICP (Ideal Customer Profile), drafts contextual engagement replies, and surfaces them for human review and approval before posting
- **Company Profile Dashboard** — Onboarding flow where businesses fill in their product description, target customer, tone of voice, and keywords; this context drives the agent's behavior
- **Prospect Review Queue** — Human-in-the-loop interface where companies review, edit, or approve AI-drafted replies before they go live (Phase 1 safety mechanism)
- **Analytics** (Phase 2) — Conversion tracking from engagement to signup/sale

## Key Context

- **Stage:** Pre-revenue. MVP in active development.
- **Business model:** SaaS subscription with a 1-day free trial to demonstrate impact before the paywall
- **Primary market:** SMBs — startups, indie founders, e-commerce brands, SaaS companies with small or no sales teams
- **Competitive positioning:** Unlike email outreach tools (Apollo, Clay), we engage at the moment of expressed need on social — real-time, contextual, high-signal
- **Architecture:** Two-sided product
  - **Service side** (`apps/agent`) — the AI engine that monitors, detects intent, and generates replies
  - **Client side** (`apps/web`) — the dashboard that customers interact with
- **Platform risk mitigation:** Phase 1 is fully human-in-the-loop (AI drafts, human posts), which keeps us within platform ToS and builds brand trust
