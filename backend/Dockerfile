FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Generate Prisma Client during image build.
# This is a placeholder URL; Compose supplies the real URL at runtime.
RUN DATABASE_URL="postgresql://litfest_user:build_only@localhost:5432/litfest?schema=public" npx prisma generate --config prisma7.config.ts

RUN npm run build

ENV NODE_ENV=production

EXPOSE 8000

# Apply committed Prisma migrations before starting the API.
CMD ["sh", "-c", "npx prisma migrate deploy --config prisma7.config.ts && npm start"]
