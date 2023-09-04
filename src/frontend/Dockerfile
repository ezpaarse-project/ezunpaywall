FROM node:18.12-alpine3.17 as build

LABEL maintainer="ezTeam <ezteam@couperin.org>"

ARG GRAPHQL_HOST
ARG UPDATE_HOST
ARG ENRICH_HOST
ARG APIKEY_HOST
ARG HEALTH_HOST
ARG MAIL_HOST
ARG MAIL_APIKEY

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build

FROM node:18.12-alpine3.17
EXPOSE 3000
ENV NODE_ENV production
COPY --from=build /usr/src/app/.output /usr/src/app
CMD [ "node", "/usr/src/app/server/index.mjs" ]