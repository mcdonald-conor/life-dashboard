FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies based on the preferred package manager
COPY package.json pnpm-lock.yaml* ./
COPY scripts/rebuild-bcrypt.js ./scripts/
RUN pnpm install --frozen-lockfile
# No need to rebuild here as postinstall script will handle it

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Install pnpm in the builder stage too
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Explicitly run bcrypt rebuild script
RUN node scripts/rebuild-bcrypt.js

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma client first
RUN pnpm prisma generate

# Copy the native bcrypt module to a safe location
RUN mkdir -p /tmp/bcrypt-lib
RUN cp -R ./node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt/lib/binding /tmp/bcrypt-lib/

# Build the application
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install runtime dependencies for bcrypt
RUN apk add --no-cache libc6-compat python3 make g++

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh
COPY --from=builder /app/scripts/rebuild-bcrypt.js ./scripts/rebuild-bcrypt.js

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install Prisma for migrations
RUN pnpm add -g prisma

# Create necessary directories and set permissions
RUN mkdir -p .next/cache node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt/lib
RUN chown -R nextjs:nodejs .next node_modules scripts

# Copy the prebuilt bcrypt native module
COPY --from=builder --chown=nextjs:nodejs /tmp/bcrypt-lib/binding /app/node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt/lib/binding
RUN chmod +x ./entrypoint.sh
RUN chmod +x ./scripts/rebuild-bcrypt.js

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "server.js"]
