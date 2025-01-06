FROM node:18.19.1-alpine3.19 AS base

LABEL maintainer="ezTeam <ezteam@couperin.org>"

FROM base AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/.output /usr/src/app

ARG ENV=development

ENV NUXT_PUBLIC_ENVIRONMENT=${NUXT_PUBLIC_ENVIRONMENT} \
  \
  NUXT_PUBLIC_UNPAYWALL_URL=${NUXT_PUBLIC_UNPAYWALL_URL} \
  NUXT_PUBLIC_UNPAYWALL_API_URL=${NUXT_PUBLIC_UNPAYWALL_API_URL} \
  \
  NUXT_PUBLIC_DASHBOARD_URL=${NUXT_PUBLIC_DASHBOARD_URL} \
  \
  NUXT_PUBLIC_GRAPHQL_URL=${NUXT_PUBLIC_GRAPHQL_URL} \
  NUXT_PUBLIC_ENRICH_URL=${NUXT_PUBLIC_ENRICH_URL} \
  NUXT_PUBLIC_ADMIN_URL=${NUXT_PUBLIC_ADMIN_URL} \
  \
  NUXT_PUBLIC_ELASTIC_ENV=${NUXT_PUBLIC_ELASTIC_ENV} \
  \
  NUXT_PUBLIC_VERSION=${NUXT_PUBLIC_VERSION} \
  \
  NUXT_ADMIN_URL=${NUXT_ADMIN_URL} \
  NUXT_ADMIN_APIKEY=${NUXT_ADMIN_APIKEY} 


HEALTHCHECK --interval=15s --timeout=10s --retries=5 --start-period=20s \
CMD wget -Y off --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

RUN addgroup -g 1001 ezunpaywall && adduser -u 1001 -G ezunpaywall -S ezunpaywall
      
RUN if [ "$ENV" = "production" ]; then \
      rm -f /bin/bash /bin/sh; \
    fi

USER ezunpaywall

EXPOSE 3000

ENTRYPOINT [ "node", "/usr/src/app/server/index.mjs" ]