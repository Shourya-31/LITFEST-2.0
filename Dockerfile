FROM node:22-bookworm-slim AS frontend-build

WORKDIR /workspace
COPY . .
WORKDIR /workspace/frontend

RUN npm ci
RUN npm run build

FROM node:22-bookworm-slim AS backend-build

WORKDIR /app/backend

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./

RUN DATABASE_URL="postgresql://litfest_user:build_only@localhost:5432/litfest?schema=public" npx prisma generate --config prisma7.config.ts
RUN npm run build

FROM node:22-bookworm-slim AS production

RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

COPY --from=backend-build /app/backend /app/backend
COPY --from=frontend-build /workspace/frontend/dist /usr/share/nginx/html
RUN rm -f /etc/nginx/sites-enabled/default /etc/nginx/conf.d/default.conf
COPY frontend/nginx.render.conf /etc/nginx/conf.d/default.conf
COPY scripts/start-render.sh /usr/local/bin/start-render.sh

RUN chmod +x /usr/local/bin/start-render.sh \
    && nginx -t

ENV NODE_ENV=production
ENV PORT=10000
ENV BACKEND_PORT=8000

EXPOSE 10000/tcp

CMD ["/usr/local/bin/start-render.sh"]
