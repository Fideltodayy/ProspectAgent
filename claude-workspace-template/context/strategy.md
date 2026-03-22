# Strategy

---

## Current Focus Period

Q1-Q2 2026 — MVP build and beta validation

## Strategic Priorities

1. **Ship a working MVP** — Full loop: company profile input → Twitter signal detection → AI reply draft → human review queue → post. This is the core product, nothing else matters until it works end-to-end.

2. **Validate willingness to pay** — 1-day free trial exposes the value immediately. Target: 10 paying beta customers at $99-299/month within 60 days of launch.

3. **Nail the onboarding experience** — The "fill your company profile" UX must be fast (<10 minutes) and immediately produce visible prospect signals. First session = first "aha moment."

4. **Stay ToS-safe in Phase 1** — Human-in-the-loop is a feature, not a limitation. Market it as "AI-assisted, human-approved." This builds trust and keeps accounts safe while we grow.

5. **Build to iterate** — Monorepo architecture separates agent service from client app so each can evolve independently. Ship clean interfaces between them from day one.

## What Success Looks Like

- End-to-end flow works: profile → prospects detected → replies drafted → posted within 24 hours
- 1-day trial converts at >20% to paid
- Beta customers report finding at least 1 real prospect per day
- Zero banned accounts (ToS compliance through human-in-the-loop)
- Team (solo founder for now) can ship new features weekly

## Key Decisions or Open Questions

- **Brand name:** TBD — using "prospect-agent" as working code name
- **Pricing tiers:** Draft: Free trial (1 day) → Starter $99/mo (50 engagements) → Growth $299/mo (200 engagements, 3 platforms) → Pro $799/mo (unlimited, semi-auto)
- **Platform expansion order after Twitter/X:** Reddit → LinkedIn → Discord/Slack communities
- **When to introduce semi-automation:** After 10+ paying customers and measurable conversion data. Not before.
- **Infrastructure:** Start simple — Next.js API routes + background jobs (no separate microservices until needed)
