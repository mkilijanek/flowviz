FROM node:24-bookworm-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-bookworm-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && npm prune --omit=dev

FROM cgr.dev/chainguard/node@sha256:99dc9c014d0d53635389a114f053c4e03385148678c1fca2fac413933c2fad5f AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/security-utils.js ./security-utils.js
COPY --from=builder /app/providers ./providers
COPY --from=builder /app/src/shared/utils ./src/shared/utils

USER 65532

EXPOSE 3001

CMD ["server.js"]
