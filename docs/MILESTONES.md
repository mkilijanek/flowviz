# Milestones

## Current baseline
`1.0.2` is the current stable line. CI, CodeQL, dependency review, Trivy, release automation, GHCR image publication, and Docker Compose validation are in place.

## Milestone: 1.0.3
- Refresh docs and examples after each patch release.
- Keep `npm audit --omit=dev` at zero and close new CodeQL alerts within one patch cycle.
- Maintain parity between local verification and GitHub Actions.
- Rebuild and publish signed container images for every release tag.

## Milestone: 1.1.0
- Increase automated coverage for provider switching, export formats, and saved-flow restore paths.
- Add browser-level smoke tests for the main analysis flow.
- Improve operator UX for provider errors, rate limiting, and empty-state recovery.
- Tighten release evidence with retained test artifacts and benchmark snapshots.

## Milestone: 1.2.0
- Add deployment profiles beyond local Compose, with production-ready environment examples.
- Expand observability with structured request metrics and error-rate dashboards.
- Review provider configuration boundaries and document support guarantees per provider.
- Define an upgrade policy for Node, Vite, and major GitHub Action changes.

## Ongoing actions
- Treat `npm run verify:release` as the minimum merge gate for release-bound changes.
- Keep README, `.env.example`, and `docs/RELEASE.md` aligned with actual workflows.
- Prefer small patch releases for security and workflow maintenance instead of batching risk.
