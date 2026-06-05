FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS seed

COPY . .

CMD ["sh", "-c", "npm run db:push:force && npm run db:seed"]

FROM deps AS build

ARG DATABASE_URL=postgres://build:build@localhost:5432/build
ARG ORIGIN=http://localhost:3000

COPY . .
RUN DATABASE_URL="${DATABASE_URL}" ORIGIN="${ORIGIN}" BETTER_AUTH_SECRET="build-time-placeholder-secret-change-at-runtime" npm run build

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=build /app/src/lib/server/db ./src/lib/server/db

EXPOSE 3000

CMD ["sh", "-c", "node scripts/ensure-meeting-schema.mjs && node build/index.js"]
