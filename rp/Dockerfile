FROM node:14.15.5-alpine3.13 AS generate
LABEL maintainer="ezTEAM <ezteam@couperin.org>"

ARG API_URL

ENV NODE_ENV production

WORKDIR /usr/src/client

COPY ./client/package.json /usr/src/client/
RUN npm install && npm cache clean --force
COPY ./client/ /usr/src/client/

RUN npm run generate

FROM nginx:1.20.1-alpine
COPY --from=generate /usr/src/client/dist /usr/share/nginx/html