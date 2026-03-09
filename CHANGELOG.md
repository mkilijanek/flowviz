# Changelog

## 1.0.0 - 2026-03-09

- Added multi-provider AI analysis support with Anthropic, OpenAI, and Ollama configuration.
- Added automated CI, Docker Compose validation, Docker image build flow, and release workflow.
- Added production Docker packaging with `Dockerfile`, `docker-compose.yml`, and release smoke checks.
- Hardened release readiness with DNS-aware SSRF validation, streaming parser regression coverage, and server smoke tests.
- Updated project verification commands with `smoke:release` and `verify:release`.
