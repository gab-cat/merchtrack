FROM gabcat/merchtrack:cache AS builder
LABEL author=gab-cat

WORKDIR /app
COPY . .

RUN npm i -g dotenv-cli@8.0.0
ARG DATABASE_URL
ARG CLERK_PUBLISHABLE_KEY
RUN DATABASE_URL="$DATABASE_URL" \
	NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" \
	npx prisma migrate deploy && \
	npm run build

# Stage: Runner
FROM node:22.12.0-alpine3.21 AS runner
LABEL author=gab-cat

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=build

RUN addgroup --system --gid 1001 nodejs && \
	adduser --system --uid 1001 nextjs && \
	mkdir .next && \
	chown nextjs:nodejs .next


# Copy only the necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Ensure nextjs has ownership of the entire app
RUN chown -R nextjs:nodejs /app

USER nextjs
# Expose port 3000
EXPOSE 3000

# Start the Next.js app
CMD ["node", "server.js"]

