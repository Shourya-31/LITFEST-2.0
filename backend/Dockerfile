FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .

# Prisma requires a datasource URL for generation, but does not connect to it.
RUN DATABASE_URL="postgresql://build:build@db.invalid:5432/build?schema=public" npx prisma generate --config prisma7.config.ts

RUN npm run build

ENV NODE_ENV=production

EXPOSE 8000

# Apply committed Prisma migrations before starting the API.
CMD ["sh", "-c", "npx prisma migrate deploy --config prisma7.config.ts && npm start"]
