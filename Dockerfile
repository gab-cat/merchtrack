
FROM --platform=linux/amd64 node:22.12.0-alpine3.21 AS base

# STAGE 1: DEPS
FROM base AS deps
LABEL author=gab-cat
LABEL last_updated="2025-05-09"

WORKDIR /app

# Copy package files and install dependencies
COPY pnpm-lock.yaml package.json ./
COPY prisma ./prisma

RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

# Create .npmrc file to enable necessary build scripts
RUN echo "enable-pre-post-scripts=true" > .npmrc && \
    echo "auto-install-peers=true" >> .npmrc && \
    echo "strict-peer-dependencies=false" >> .npmrc

RUN pnpm install --unsafe-perm



# STAGE 2: BUILD
FROM gabcat/merchtrack:cache AS builder
LABEL author=gab-cat

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV APP_ENV=build
RUN corepack enable pnpm && npm i -g dotenv-cli@8.0.0 && npx next telemetry disable && dotenv -e .env -- pnpm run build

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
RUN chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]


