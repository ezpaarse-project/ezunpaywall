FROM node:14.15.5-alpine3.13
LABEL maintainer="ezTeam <ezteam@couperin.org>"

ARG GRAPHQL_HOST
ARG UPDATE_HOST
ARG ENRICH_HOST
ARG APIKEY_HOST
ARG MAIL_HOST

ENV NODE_ENV production

WORKDIR /frontend

COPY package*.json /frontend/
RUN npm ci --only=production
COPY . /frontend

RUN npm run build


EXPOSE 8080
CMD [ "npm", "start" ]