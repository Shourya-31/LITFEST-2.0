FROM node:22-bookworm-slim AS build

WORKDIR /workspace

COPY . .

WORKDIR /workspace/frontend

RUN npm ci
RUN npm run build

FROM nginx:alpine

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/frontend/dist /usr/share/nginx/html

EXPOSE 80
