FROM node:18.19.1-alpine3.19 AS base

LABEL maintainer="ezTeam <ezteam@couperin.org>"

FROM base AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev

FROM base
WORKDIR /usr/src/app
COPY --from=builder  /usr/src/app/node_modules ./node_modules 
COPY . .

ENV TIMEZONE=${TIMEZONE} \
  \
  REDIS_HOST=${REDIS_HOST} \
  REDIS_PORT=${REDIS_PORT} \
  REDIS_PASSWORD=${REDIS_PASSWORD} \
  \
  ELASTICSEARCH_NODES=${ELASTICSEARCH_NODES} \
  ELASTICSEARCH_USERNAME=${ELASTICSEARCH_USERNAME} \
  ELASTICSEARCH_PASSWORD=${ELASTICSEARCH_PASSWORD} \
  ELASTICSEARCH_MAX_BULK_SIZE=${ELASTICSEARCH_MAX_BULK_SIZE} \
  ELASTICSEARCH_INDEX_ALIAS=${ELASTICSEARCH_INDEX_ALIAS} \
  ELASTICSEARCH_TIMEOUT=${ELASTICSEARCH_TIMEOUT} \
  \
  HEALTH_TIMEOUT=${HEALTH_TIMEOUT}

HEALTHCHECK --interval=15s --timeout=10s --retries=5 --start-period=20s \
  CMD wget -Y off --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

RUN addgroup -g 1001 appUser && adduser -u 1001 -G appUser -S appUser
RUN mkdir -p ./log \
  && chown -R appUser:appUser ./log \ 
  && chmod -R 700 ./log \
  && rm -f /bin/bash \
  && rm -f /bin/sh
  
USER appUser

EXPOSE 3000

ENTRYPOINT [ "node", "./src/app.js" ]