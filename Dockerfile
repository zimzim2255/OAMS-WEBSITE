# ---- build stage ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# --ignore-scripts: don't run the "postinstall: prisma generate" here (no .env /
# DATABASE_URL at build time). prisma client is generated explicitly in the
# builder stage below. Native deps (sharp/esbuild) use prebuilt binaries.
RUN npm ci --ignore-scripts

# ---- builder (generate prisma client + build next) ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# ---- runner (small) ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.ts ./
EXPOSE 3000
# apply migrations then boot the Next.js node server
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]