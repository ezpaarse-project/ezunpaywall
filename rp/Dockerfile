FROM node:14.15.5-alpine3.13 AS generate
LABEL maintainer="ezTEAM <ezteam@couperin.org>"

ARG GRAPHQL_URL
ARG UPDATE_URL
ARG ENRICH_URL

ENV NODE_ENV production

WORKDIR /usr/src/frontend

COPY ./src/frontend/package*.json /usr/src/frontend/
RUN npm ci --only=production
COPY ./src/frontend/ /usr/src/frontend/

RUN npm run generate

FROM nginx:1.20.1-alpine
COPY --from=generate /usr/src/frontend/dist /usr/share/nginx/html