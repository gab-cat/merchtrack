FROM gabcat/merchtrack:cache-bun AS builder
LABEL author=gab-cat

WORKDIR /app
COPY . .

ENV NODE_ENV=production
ENV APP_ENV=build

RUN bunx next telemetry disable && bun install && bunx dotenv-cli -e .env -- bun run build

# Stage: Runner
FROM oven/bun:1.2.2-alpine AS runner
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
RUN chown nextjs:nodejs .env && chown -R nextjs:nodejs /app && bun add react react-dom

USER nextjs
EXPOSE 3000

ENTRYPOINT ["bun", "server.js"]


