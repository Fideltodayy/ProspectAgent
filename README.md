# ProspectAgent

> AI agent that finds your customers on social media — so you don't have to.

**SYNTHESIS Hackathon Submission** | Built on Base L2 | Ethereum-native from the ground up

---

## The Problem

Customer acquisition is broken for small businesses. They can't afford sales teams. Cold outreach is noisy. The signal is already out there — people tweet their frustrations, ask for recommendations, and compare tools in public every day. Most businesses miss every single one of those moments.

## The Solution

ProspectAgent is an AI agent that:

1. **Monitors** Twitter/X in real time for buying signals matching your business
2. **Detects intent** — Claude classifies whether a tweet is genuine demand or noise (scored 0–1)
3. **Drafts replies** — contextual, human-sounding, on-brand responses
4. **Surfaces them** for human review — approve, edit, or skip before anything posts
5. **Posts on your behalf** — one click, direct to Twitter

Businesses fill in their company profile once. The agent runs continuously.

---

## Ethereum Integration — Four Themes Addressed

### Agents That Pay — USDC Subscriptions on Base L2

**`contracts/src/ProspectAgentSubscription.sol`**

Replaced traditional Stripe billing with an on-chain USDC subscription contract deployed on Base. Businesses pay monthly in USDC (6 decimals). The contract manages plan tiers (Starter $99, Growth $299, Pro $799), a 1-day on-chain free trial, and renewal logic.

The agent service calls `hasAccess(walletAddress)` directly on-chain before processing any company's monitoring jobs. Payment and service delivery are cryptographically linked — no DB override possible.

```
Base Mainnet USDC: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
Trial: 1 day, one per wallet address
Plans: Starter (50 engagements) / Growth (200) / Pro (unlimited)
```

### Agents That Trust — ENS Brand Identity + On-Chain Agent Registration

**`apps/web/src/lib/identity/ens.ts`**

Companies can verify their brand identity via their ENS name. We resolve the ENS name to confirm it matches their connected wallet, then pull avatar and Twitter handle from ENS text records. ENS-verified companies get a trust badge — their replies carry verifiable on-chain provenance.

**ProspectAgent itself is registered on-chain** — our agent has an Ethereum identity via the SYNTHESIS ERC-8004 registration:
- Registration Tx: `0x6f96697e4dce9d6ea778f14f782a34cbede0491c935eff694825b1017173ae32`

### Agents That Keep Secrets — Lit Protocol Credential Encryption

**`apps/web/src/lib/secrets/lit-credentials.ts`**

Company Twitter API credentials are encrypted via Lit Protocol before being stored. The access control conditions are:

```
Caller must be the ProspectAgent wallet address
AND
Company's subscriber wallet must have hasAccess() == true on the Base contract
```

This means:
- Credentials are never plaintext in our database
- If a subscription lapses, the agent literally cannot decrypt credentials — automatic hard cutoff
- Even if our DB is breached, credentials are protected by cryptographic access conditions on Lit's network

### Agents That Cooperate — On-Chain Service Agreement

The subscription contract is the enforcement layer between ProspectAgent (service provider) and the business (customer). Terms are immutable and auditable — no TOS PDFs, no disputes about what was agreed.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    apps/web (Next.js)                │
│  Onboarding → Review Queue → Subscribe → Analytics  │
│  RainbowKit + wagmi (Base L2) | Clerk Auth          │
└────────────────────┬────────────────────────────────┘
                     │ internal API (secret-auth)
                     │ BullMQ jobs → Redis
┌────────────────────▼────────────────────────────────┐
│                 apps/agent (Node.js)                 │
│  Twitter Monitor → Intent Detector → Reply Generator │
│  Claude claude-sonnet-4-6 | Anthropic SDK            │
│  On-chain access check (Base L2 contract)           │
└─────────────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│              Ethereum / Base L2                      │
│  ProspectAgentSubscription.sol (USDC payments)      │
│  Lit Protocol (encrypted credential storage)        │
│  ENS (brand identity verification)                  │
└─────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|---|---|
| AI Agent | Anthropic Claude API (claude-sonnet-4-6) |
| Web App | Next.js 14 App Router, TypeScript, Tailwind |
| Agent Service | Node.js, BullMQ, Redis |
| Database | PostgreSQL + Prisma |
| Auth | Clerk |
| Blockchain | Base L2 (payments), Ethereum mainnet (ENS) |
| Web3 Frontend | wagmi v2, viem, RainbowKit |
| Smart Contracts | Solidity 0.8.24, OpenZeppelin, Hardhat |
| Credential Privacy | Lit Protocol |
| Identity | ENS, ERC-8004 (agent registration) |

## Running Locally

```bash
# Install
pnpm install

# Set up env
cp apps/web/.env.example apps/web/.env
cp apps/agent/.env.example apps/agent/.env
# Fill in API keys (Anthropic, Twitter, Clerk, Stripe, Redis, DB, contract address)

# Database
cd apps/web && pnpm exec prisma migrate dev

# Deploy contract (Base Sepolia testnet)
cd contracts && cp .env.example .env
pnpm run deploy:base-sepolia

# Run everything
pnpm dev
```

## Partner Integrations

- **Base** — USDC subscription contract on Base L2
- **ENS** — Brand identity verification via ENS name resolution
- **Lit Protocol** — Encrypted credential storage with on-chain access conditions
- **MetaMask / RainbowKit** — Wallet connection in the dashboard

## Human-Agent Collaboration Log

This project was built by Fidel Otieno (founder) and ProspectAgent (Claude-powered AI agent) during the SYNTHESIS hackathon building period (March 13–22, 2026).

The human brought: product vision, market insight (SMBs need this), and the go-to-market instinct ("finding customers shouldn't be this hard").

The agent brought: architecture design, full implementation across smart contracts / backend / frontend, blockchain integration strategy, and real-time execution on the final build day.

Key pivot during the build: started with Stripe as the billing layer, then replaced it with on-chain USDC subscriptions on Base — making payment the cryptographic access key to the service itself, not just a billing detail.

---

*ProspectAgent — registered on Base L2 — SYNTHESIS 2026*
