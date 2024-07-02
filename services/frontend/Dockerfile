FROM node:18.19.1-alpine3.19 as build

LABEL maintainer="ezTeam <ezteam@couperin.org>"

ARG NUXT_PUBLIC_ENVIRONMENT
ARG NUXT_PUBLIC_UNPAYWALL_HOST
ARG NUXT_PUBLIC_UNPAYWALL_API_HOST
ARG NUXT_PUBLIC_DASHBOARD_HOST
ARG NUXT_PUBLIC_GRAPHQL_HOST
ARG NUXT_PUBLIC_UPDATE_HOST
ARG NUXT_PUBLIC_ENRICH_HOST
ARG NUXT_PUBLIC_APIKEY_HOST
ARG NUXT_PUBLIC_MAIL_HOST
ARG NUXT_PUBLIC_ELASTIC_ENV
ARG NUXT_PUBLIC_VERSION
ARG NUXT_MAIL_HOST
ARG NUXT_MAIL_APIKEY

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:18.19.1-alpine3.19
EXPOSE 3000
ENV NODE_ENV production
COPY --from=build /usr/src/app/.output /usr/src/app

HEALTHCHECK --interval=1m --timeout=10s --retries=5 --start-period=20s \
  CMD wget -Y off --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD [ "node", "/usr/src/app/server/index.mjs" ]