FROM node:25-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:25-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/security-utils.js ./security-utils.js
COPY --from=builder /app/providers ./providers
COPY --from=builder /app/src/shared/utils ./src/shared/utils

EXPOSE 3001

CMD ["npm", "run", "start"]
