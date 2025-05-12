
FROM --platform=linux/amd64 node:22.12.0-alpine3.21 AS base

# STAGE 1: DEPS
FROM base AS deps
LABEL author=gab-cat
LABEL last_updated="2025-05-09"

WORKDIR /app

# Copy package files and install dependencies
COPY bun.lock package.json ./
COPY prisma ./prisma

RUN apk add --no-cache libc6-compat
RUN npm install -g bun

RUN bun install


# STAGE 2: BUILD
FROM base AS builder
LABEL author=gab-cat

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
RUN npm i -g dotenv-cli@8.0.0 bun && npx next telemetry disable
COPY . .

ENV NODE_ENV=production

RUN dotenv -e .env -- bun run build

# Stage: Runner
FROM base AS runner
LABEL author=gab-cat

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV APP_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir .next && \
    chown nextjs:nodejs .next

# Copy only the necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Ensure environment file and app directory are owned by nextjs user
RUN chown -R nextjs:nodejs /app && rm .env

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]


