FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci
RUN npm install @tailwindcss/oxide-linux-x64-musl

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

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