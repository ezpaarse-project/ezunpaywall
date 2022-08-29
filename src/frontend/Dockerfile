FROM node:14.15.5-alpine3.13
LABEL maintainer="ezTeam <ezteam@couperin.org>"

ARG GRAPHQL_URL
ARG UPDATE_URL
ARG ENRICH_URL
ARG APIKEY_URL
ARG MAIL_URL

ENV NODE_ENV production

WORKDIR /frontend

COPY package*.json /frontend/
RUN npm ci --only=production
COPY . /frontend

RUN npm run build


EXPOSE 8080
CMD [ "npm", "start" ]