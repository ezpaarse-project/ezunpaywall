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

ARG ENV=development

ENV TIMEZONE=${TIMEZONE} \
  \
  REDIS_HOST=${REDIS_HOST} \
  REDIS_PORT=${REDIS_PORT} \
  REDIS_PASSWORD=${REDIS_PASSWORD} \
  \
  GRAPHQL_URL=${GRAPHQL_URL} \
  HEALTH_TIMEOUT=${HEALTH_TIMEOUT} 

HEALTHCHECK --interval=15s --timeout=10s --retries=5 --start-period=20s \
CMD wget -Y off --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

RUN addgroup -g 1001 ezunpaywall && adduser -u 1001 -G ezunpaywall -S ezunpaywall
RUN mkdir -p ./log/access ./log/application ./log/healthcheck ./data/enriched ./data/states ./data/upload \
  && chmod -R 700 ./log ./data \
  && chown -R ezunpaywall:ezunpaywall ./log ./data 

RUN if [ "$ENV" = "production" ]; then \
      rm -f /bin/bash /bin/sh; \
    fi

USER ezunpaywall

EXPOSE 3000

ENTRYPOINT [ "node", "./src/app.js" ]