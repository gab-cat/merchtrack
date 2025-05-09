FROM gabcat/merchtrack:cache AS builder
LABEL author=gab-cat

WORKDIR /app
COPY . .

ENV NODE_ENV=production
ENV APP_ENV=build

RUN npm i -g dotenv-cli@8.0.0 corepack && \
    npx next telemetry disable && \
    corepack enable pnpm && \
    dotenv -e .env -- pnpm run build

# Stage: Runner
FROM node:22.12.0-alpine3.21 AS runner
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


