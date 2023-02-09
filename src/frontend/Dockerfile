FROM node:16.19.0-alpine3.17
LABEL maintainer="ezTeam <ezteam@couperin.org>"

ARG GRAPHQL_HOST
ARG UPDATE_HOST
ARG ENRICH_HOST
ARG APIKEY_HOST
ARG MAIL_HOST

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY package*.json /usr/src/app/
RUN npm ci --omit=dev
COPY . /usr/src/app

RUN npm run build

CMD [ "npm", "start" ]