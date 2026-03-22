# CLAUDE.md

This file provides guidance to Claude Code when working in this workspace.

---

## What This Is

This is the Claude workspace for building a **SaaS AI prospect agent** — a product that helps SMBs find and engage customers in real time on social platforms (Twitter/X first, expanding to Reddit, LinkedIn, and communities).

The product lets businesses fill in their company profile and then lets an AI agent monitor social signals, detect buying intent, draft contextual replies, and surface them for human review and approval.

**Two codebases, one workspace:**
- `apps/agent` — The AI engine (service side): monitoring, intent detection, reply generation
- `apps/web` — The customer dashboard (client side): onboarding, prospect queue, analytics, billing

This Claude workspace lives in `claude-workspace-template/` and serves as the operational brain across sessions. The product code lives at the project root.

---

## The Claude-User Relationship

- **User**: Technical founder who codes and sells simultaneously. Uses Claude as an accelerator — strategy, implementation, and iteration partner.
- **Claude**: Reads context, understands product goals, executes commands, writes code, and maintains workspace consistency.

Always run `/prime` at session start to reload context. Then act with full awareness of what we're building, the current phase, and the architecture decisions already made.

---

## Workspace Structure

```
claude-workspace-template/
├── CLAUDE.md                  # This file — always loaded
├── .claude/
│   └── commands/
│       ├── prime.md           # /prime — session initialization
│       ├── create-plan.md     # /create-plan — plan features/changes
│       └── implement.md       # /implement — execute plans
├── context/
│   ├── business-info.md       # What the product is, market, architecture
│   ├── personal-info.md       # Founder role, working style
│   ├── strategy.md            # Current priorities, pricing, phase gates
│   └── current-data.md        # Metrics, current state, blockers
└── docs/
    └── product-phases.md      # Full phase breakdown with features, pricing, risk register
```

**Product codebase (at project root):**

```
/home/fidel/PROJECTS/Customer-Agent/
├── apps/
│   ├── web/                   # Next.js dashboard (client side)
│   └── agent/                 # Node.js AI engine (service side)
└── packages/
    └── shared/                # Shared TypeScript types
```

---

## Commands

### /prime
Initialize a session. Reads CLAUDE.md + context/ and confirms readiness.

### /create-plan [request]
Create a detailed implementation plan in `plans/` before making changes.
Example: `/create-plan add Reddit monitoring to the agent`

### /implement [plan-path]
Execute a plan step by step, validate, and update plan status.
Example: `/implement plans/2026-03-22-add-reddit-monitoring.md`

---

## Current Phase

**Phase 1 — MVP (Human-in-the-Loop)**

See `docs/product-phases.md` for the complete roadmap.

**Active priorities:**
1. End-to-end flow: company profile → Twitter signal detection → intent classification → reply draft → review queue → post
2. Working dashboard with onboarding and prospect review UI
3. 1-day free trial with Stripe paywall
4. 10 paying beta customers

---

## Architecture Decisions (Do Not Revisit Without Good Reason)

- **Monorepo:** pnpm workspaces. `apps/web`, `apps/agent`, `packages/shared`.
- **Agent:** Node.js + TypeScript service. Uses Anthropic Claude API (claude-sonnet-4-6) for intent detection and reply generation.
- **Web:** Next.js 14 App Router + TypeScript + Tailwind CSS.
- **Database:** PostgreSQL + Prisma.
- **Queue:** BullMQ + Redis for background monitoring jobs.
- **Auth:** Clerk.
- **Billing:** Stripe (1-day trial → subscription).
- **Phase 1 constraint:** Human-in-the-loop only. No auto-posting. This is a feature, not a limitation.

---

## Critical Instruction: Maintain This File

After any structural change — new command, new app, new workflow — update this file. It must always reflect the current state of the workspace and codebase.

---

## Session Workflow

1. `/prime` — Load context and confirm readiness
2. Direct Claude to tasks or use `/create-plan` for significant additions
3. `/implement [plan]` to execute
4. Update `context/current-data.md` as state changes
