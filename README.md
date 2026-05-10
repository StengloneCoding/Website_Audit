# AI Visibility Readiness Audit (MVP)

AI Visibility Readiness Audit is a lightweight analysis tool for website URLs.
It evaluates technical and semantic readiness signals that help search engines and AI systems interpret a page.

## Project Goal

Provide a fast, explainable audit that highlights whether a page communicates clear machine-readable context about:

- the business
- services
- location
- topical authority

This product is built as an MVP for practical diagnostics and action-oriented recommendations.

## Scope and Positioning

This tool does not measure actual rankings in Google, ChatGPT or other AI systems. It evaluates whether a page provides clear technical and semantic signals that make it easier for search engines and AI systems to understand the business, its services, location and topical authority.

## What the Tool Checks

The audit computes weighted checks across five categories:

- SEO Basics (25): title, meta description, H1, canonical, robots, basic on-page structure
- Content Clarity (25): topic alignment, explanatory copy, FAQ-like content, contact visibility
- Entity Signals (25): business naming, service specificity, audience and expertise cues
- Structured Data (15): JSON-LD presence, validity, schema type coverage
- Technical Accessibility (10): HTTPS, response timing, HTML size, crawl-friendly traits

Output includes:

- overall score (0-100)
- per-category scores
- strong/weak signals
- prioritized issues
- recommendations
- extracted terms and schema metadata

## What the Tool Explicitly Does Not Check

- No live ranking positions (Google, Bing, LLM UIs, etc.)
- No traffic, conversion, or attribution analytics
- No backlink profile or off-page authority analysis
- No direct Search Console or ads platform performance metrics

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Zod (request and input validation)
- Cheerio (HTML parsing)
- Vitest + Testing Library (unit/component tests)
- ESLint

## Architecture

The codebase follows a clear separation of concerns:

- UI layer in components and app pages
- API orchestration in app/api/audit/route.ts
- domain logic in lib/audit/\*

Flow:

1. Validate URL input
2. Fetch and normalize page HTML
3. Parse content and extract signals (SEO, terms, JSON-LD)
4. Run category-specific checks
5. Compute weighted score and issue/recommendation output
6. Return structured JSON for UI or external API consumers

## TDD / CDD Approach

- Business logic is covered with unit tests.
- URL validation, parsing, JSON-LD extraction, keyword extraction and scoring are tested independently.
- UI components are built component-first with clear props and basic render/interaction tests.
- The API route is intentionally thin and orchestrates tested modules.

## Setup

Requirements:

- Node.js 22+
- npm

Install and run locally:

```bash
npm ci
npm run dev
```

Build and production start:

```bash
npm run build
npm run start
```

Note: npm run start runs on port 3003 in this project.

## Test Commands

```bash
npm test
npm run test:watch
npm run test:coverage
npm run lint
npm run typecheck
```

## API Example

Endpoint:

- POST /api/audit

Request body:

```json
{
  "url": "https://example.com"
}
```

cURL:

```bash
curl -X POST http://localhost:3000/api/audit \
	-H "Content-Type: application/json" \
	-d '{"url":"https://example.com"}'
```

## Example Response

```json
{
  "url": "https://example.com/",
  "score": 74,
  "categories": [
    {
      "category": "seoBasics",
      "label": "SEO-Basics",
      "score": 18.5,
      "maxScore": 25,
      "percentage": 74,
      "passedChecks": 6,
      "totalChecks": 8
    }
  ],
  "strongSignals": [],
  "weakSignals": [],
  "issues": [],
  "recommendations": [],
  "frequentTerms": [
    {
      "term": "audit",
      "count": 4,
      "share": 6.7
    }
  ],
  "schemaTypes": ["Organization", "WebSite"],
  "metadata": {
    "analyzedAt": "2026-05-11T10:30:00.000Z",
    "requestedUrl": "https://example.com",
    "finalUrl": "https://example.com/",
    "technical": {
      "status": 200,
      "contentType": "text/html; charset=utf-8",
      "responseTimeMs": 312,
      "htmlBytes": 154221,
      "redirectCount": 0
    },
    "structuredData": {
      "rawBlockCount": 2,
      "validItemCount": 2,
      "invalidBlockCount": 0
    }
  },
  "checks": []
}
```

## Scoring Model

- Weighted checks per category
- Category score normalized to category max
- Total score is the rounded sum of normalized category scores
- Final score range: 0-100

Category weighting:

- SEO Basics: 25
- Content Clarity: 25
- Entity Signals: 25
- Structured Data: 15
- Technical Accessibility: 10

## Security Notes

- URL validation blocks local/private/loopback targets
- Only HTTP/HTTPS URLs are accepted
- Embedded credentials in URLs are rejected
- Manual redirect handling with redirect limit
- Request timeout and response size guardrails
- HTML content-type enforcement

These controls reduce SSRF-style risk and improve API reliability.

## Future Extensions

- PageSpeed Insights API integration
- Supabase/PostgreSQL persistence
- Lead Capture
- Email Reports
- Background Jobs
- Rate Limiting
- LLM-based Entity Extraction

## AI-assisted Development Note

This MVP was developed with AI-assisted workflows under explicit engineering constraints:

- test-first implementation for core logic
- component-driven UI iteration
- strict module boundaries between API orchestration and domain logic
- human review over architecture, scoring assumptions, and security boundaries

AI assistance accelerated implementation, but product direction, constraints, and quality gates are owned by the development team.
