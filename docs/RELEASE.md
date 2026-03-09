# Release Runbook

## Scope
This repository is prepared for `1.0.2` with automated verification for lint, tests, production build, API smoke tests, Docker Compose image builds, container publication, and security scanning.

## Pre-release checklist
1. Run `npm run verify:release`.
2. Confirm `npm audit --omit=dev` returns zero vulnerabilities.
3. Review `CHANGELOG.md` and update release notes if user-facing behavior changed.
4. Ensure `.env.example` matches supported providers and deployment defaults.
5. Verify Docker startup with `docker compose up --build`.

## Release procedure
1. Merge the release-ready branch into `main`.
2. Create and push a tag such as `v1.0.2`.
3. Allow the `Release` GitHub Actions workflow to complete.
4. Validate the generated GitHub Release entry and attached files.

## Rollback
1. Re-deploy the previous stable Git tag or Docker image.
2. Revert the offending commit on `main` if needed.
3. Re-run `npm run verify:release` on the rollback candidate.
4. Publish a corrective patch release, for example `v1.0.3`.

## Supported verification commands
- `npm run lint`
- `npm test`
- `npm run build`
- `npm run smoke:release`
- `docker compose config`
- `docker compose build`
