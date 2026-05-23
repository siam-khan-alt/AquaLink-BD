FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# (Keep your dummy production build ENV variables exactly as they were here)
ENV MONGODB_URI="mongodb://localhost:27017/dummy"
ENV GEMINI_API_KEY="dummy_key"
ENV NEXTAUTH_SECRET="dummy_secret"
ENV NEXT_PUBLIC_FIREBASE_API_KEY="dummy_firebase_key"
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="dummy.firebaseapp.com"
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID="dummy-project"
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="dummy.appspot.com"
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1234567890"
ENV NEXT_PUBLIC_FIREBASE_APP_ID="1:123456:web:abc123xyz"
ENV NEXT_PHASE=phase-production-build
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# CRITICAL: Install real Chromium inside the runner stage so Puppeteer can find it
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Force Puppeteer to skip downloading its own binary and use the system container's chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]