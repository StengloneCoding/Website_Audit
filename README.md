# AI Visibility Readiness Audit

AI Visibility Readiness Audit is an MVP for analyzing website URLs and scoring how clearly a page communicates technical and semantic signals to search engines and AI systems.

## Short Description

The product runs a focused audit on a public website URL, loads its HTML, extracts machine-readable signals, and returns a structured readiness score with issues and recommendations.

## Project Goal

The goal of this project is to provide a fast, explainable audit that shows whether a page gives search engines and AI systems enough context to understand:

- the business
- its services
- its location
- its topical authority

This is intended as a practical diagnostic tool for teams that want clearer technical and semantic visibility signals without making inflated ranking claims.

## Scope and Positioning

This tool does not measure actual rankings in Google, ChatGPT or other AI systems. It evaluates whether a page provides clear technical and semantic signals that make it easier for search engines and AI systems to understand the business, its services, location and topical authority.

## What the Tool Checks

The audit evaluates weighted checks across five categories:

- SEO Basics: title, meta description, H1, canonical, robots directives, basic on-page structure
- Content Clarity: topic alignment, explanatory copy, FAQ-like content, visible contact options
- Entity Signals: business naming, service specificity, audience cues, expertise cues, recurring relevant terms
- Structured Data: JSON-LD presence, validity, schema type coverage
- Technical Accessibility: HTTPS, response timing, HTML size, crawl-friendly accessibility traits

The output includes:

- an overall score from 0 to 100
- normalized category scores
- strong signals
- weak signals
- prioritized issues
- concrete recommendations
- frequent terms
- schema summary metadata

## What the Tool Explicitly Does Not Check

- Actual search rankings in Google, ChatGPT, Perplexity, Bing, or other AI/search interfaces
- Traffic, conversions, attribution, or analytics performance
- Backlink profiles or off-page authority
- Search Console data or ads platform metrics
- Lighthouse API or PageSpeed metrics in version 1

## Tech Stack

- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS
- Zod for request validation
- Cheerio for HTML parsing
- Vitest for unit and component tests
- React Testing Library for UI testing
- ESLint for code quality

## Architecture

The project is split into clear layers:

- `app/*`: page and API entrypoints
- `components/*`: reusable UI components
- `lib/audit/*`: domain logic for validation, fetching, parsing, extraction, checks, and scoring
- `tests/audit/*`: unit tests for audit logic
- `components/__tests__/*`: component tests for UI behavior

High-level request flow:

1. Read the request body
2. Validate the URL
3. Fetch page HTML
4. Parse the HTML
5. Extract SEO basics
6. Extract JSON-LD
7. Run structured data checks
8. Run content clarity checks
9. Run entity signal checks
10. Extract frequent terms
11. Calculate the score
12. Return a structured JSON response

The API route is intentionally thin. Business logic lives in `lib/audit/*` and is orchestrated through dedicated audit modules.

## TDD / CDD Approach

- Business logic is covered with unit tests.
- URL validation, parsing, JSON-LD extraction, keyword extraction and scoring are tested independently.
- UI components are built component-first with clear props and basic render/interaction tests.
- The API route is intentionally thin and orchestrates tested modules.

This keeps the scoring model, extraction logic, and UI behavior independently testable and easier to evolve.

## Setup

Requirements:

- Node.js 22+
- npm

Install dependencies:

```bash
npm ci
```

Run the development server:

```bash
npm run dev
```

Build and run production mode:

```bash
npm run build
npm run start
```

Notes:

- `npm run dev` uses the standard Next.js development server
- `npm run start` serves the built app on port `3003`

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

- `POST /api/audit`

Request body:

```json
{
  "url": "https://example.com"
}
```

cURL example:

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
    },
    {
      "category": "structuredData",
      "label": "Strukturierte Daten",
      "score": 10.0,
      "maxScore": 15,
      "percentage": 67,
      "passedChecks": 3,
      "totalChecks": 5
    }
  ],
  "strongSignals": [
    {
      "id": "seo-title-present",
      "label": "Ein Title-Tag ist vorhanden",
      "passed": true,
      "weight": 5,
      "category": "seoBasics",
      "impact": "high",
      "recommendation": "Ergänze ein eindeutiges Title-Tag."
    }
  ],
  "weakSignals": [
    {
      "id": "structured-service",
      "label": "Service-Schema ist vorhanden",
      "passed": false,
      "weight": 2,
      "category": "structuredData",
      "impact": "medium",
      "recommendation": "Ergänze Service-Schema."
    }
  ],
  "issues": [
    {
      "id": "structured-service",
      "label": "Service-Schema ist vorhanden",
      "category": "structuredData",
      "impact": "medium",
      "weight": 2,
      "recommendation": "Ergänze Service-Schema."
    }
  ],
  "recommendations": [
    {
      "id": "recommendation-structured-service",
      "label": "Service-Schema ist vorhanden",
      "text": "Ergänze Service-Schema.",
      "category": "structuredData",
      "impact": "medium",
      "sourceCheckId": "structured-service"
    }
  ],
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
    "requestedUrl": "https://example.com/",
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
  "checks": [
    {
      "id": "seo-title-present",
      "label": "Ein Title-Tag ist vorhanden",
      "passed": true,
      "weight": 5,
      "category": "seoBasics",
      "impact": "high",
      "recommendation": "Ergänze ein eindeutiges Title-Tag."
    }
  ]
}
```

## Scoring Model

The scoring model is weighted and normalized by category.

- SEO Basics: 25 points
- Content Clarity: 25 points
- Entity Signals: 25 points
- Structured Data: 15 points
- Technical Accessibility: 10 points

Rules:

- Each check has a weight and pass/fail status
- Scores are normalized to the category maximum
- The total score is the rounded sum of normalized category scores
- The final score range is `0-100`

This keeps missing structured data important, but prevents a single category from disproportionately dominating the total result.

## Security Notes

The MVP includes basic guardrails for safe remote auditing:

- only `http` and `https` URLs are allowed
- localhost, loopback, and private network targets are blocked
- embedded credentials in URLs are rejected
- redirects are handled manually with a redirect limit
- request timeout protection is enforced
- response size limits are enforced
- only HTML responses are accepted

These controls reduce SSRF-style risk and improve reliability for the public-facing audit workflow.

## Extension Opportunities

Potential future extensions include:

- PageSpeed Insights API
- Supabase/PostgreSQL
- Lead Capture
- Email Reports
- Background Jobs
- Rate Limiting
- LLM-based Entity Extraction

## AI-assisted Development Note

This MVP was developed with AI-assisted workflows under explicit engineering constraints.

- Test-first implementation is used for core audit logic.
- Component-driven development is used for reusable UI pieces.
- Business logic and presentation are intentionally separated.
- Human review remains responsible for product direction, scoring assumptions, and quality decisions.

AI assistance accelerated implementation, but the system design, constraints, and quality bar are owned by the development team.
