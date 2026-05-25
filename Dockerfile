# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package.json .
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
RUN apk add --no-cache postgresql16 postgresql16-client su-exec && \
    mkdir -p /var/lib/postgresql/data && \
    chown -R postgres:postgres /var/lib/postgresql

WORKDIR /app
COPY backend/package.json .
RUN npm install --production
COPY backend/src ./src
COPY --from=frontend-builder /app/dist ./public

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 7283
ENTRYPOINT ["/docker-entrypoint.sh"]
