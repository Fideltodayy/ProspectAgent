# Current Data

---

## Key Metrics

| Metric               | Current Value | Target (60 days) | Notes                              |
| -------------------- | ------------- | ---------------- | ---------------------------------- |
| Paying customers     | 0             | 10               | Beta program, founder-led sales    |
| MRR                  | $0            | ~$1,500          | 10 customers @ avg $150/mo         |
| Trial-to-paid rate   | N/A           | >20%             | 1-day free trial conversion        |
| Prospects/day (demo) | 0             | 10+              | Per company profile                |
| Accounts banned      | 0             | 0                | ToS compliance is non-negotiable   |

## Current State

- **MVP:** In active development. Monorepo scaffolded, agent core being built.
- **Phase:** Pre-launch. No live users yet.
- **Biggest blocker:** Twitter API access tier — need to confirm cost and rate limits for production use
- **Key risk:** Platform ToS — mitigated by human-in-the-loop in Phase 1
- **Next milestone:** End-to-end flow working locally (profile → detection → queue → review)

## Data Sources

- Twitter API v2 (search, post)
- Anthropic Claude API (intent detection, reply generation)
- PostgreSQL (user profiles, prospects, queue state)
- Stripe (billing, trial management) — Phase 1+

## Notes

_Update this file weekly as the product ships. Track real conversion data from the first beta trial onwards._
