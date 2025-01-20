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

HEALTHCHECK --interval=15s --timeout=10s --retries=5 --start-period=20s \
  CMD [ "node", "-e", "require('http').get('http://localhost:3000', res => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1));" ]

RUN mkdir -p ./log/access ./log/application ./log/healthcheck ./data/changefiles ./data/reports ./data/snapshots \
  && chmod -R 700 ./log ./data \
  && chown -R node:node ./log ./data 

RUN if [ "$ENV" = "production" ]; then \
      rm -f /bin/bash /bin/sh; \
    fi

USER node

EXPOSE 3000

ENTRYPOINT [ "node", "./src/app.js" ]