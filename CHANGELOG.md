# Changelog

## 1.0.2 - 2026-03-09

- Consolidated safe dependency and GitHub Action updates into the main branch instead of merging a large queue of Dependabot PRs one by one.
- Upgraded CI, release, Docker, CodeQL, dependency-review, and Trivy workflows to current action majors with tighter permissions and more stable execution.
- Hardened security automation with richer Trivy scanning, SARIF uploads, and quieter Dependabot policy that groups non-breaking updates and ignores semver-major noise on the stable branch.
- Refreshed runtime and frontend dependencies for the `1.0.x` line, including Express, Vite patch level, OpenAI SDK, React Query, and MUI 5.x packages.

## 1.0.0 - 2026-03-09

- Added multi-provider AI analysis support with Anthropic, OpenAI, and Ollama configuration.
- Added automated CI, Docker Compose validation, Docker image build flow, and release workflow.
- Added production Docker packaging with `Dockerfile`, `docker-compose.yml`, and release smoke checks.
- Hardened release readiness with DNS-aware SSRF validation, streaming parser regression coverage, and server smoke tests.
- Updated project verification commands with `smoke:release` and `verify:release`.
