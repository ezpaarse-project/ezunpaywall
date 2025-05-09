FROM node:22.13.1-alpine3.21 AS base

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

HEALTHCHECK --interval=15s --timeout=10s --retries=5 --start-period=20s CMD ["node", "./healthcheck.js"]

RUN mkdir -p ./log/access ./log/application ./log/healthcheck ./data/changefiles ./data/reports ./data/snapshots \
  && chmod -R 700 ./log ./data \
  && chown -R node:node ./log ./data

RUN if [ "$ENV" = "production" ]; then \
      rm -f /bin/sh; \
    fi

USER node

EXPOSE 3003

ENTRYPOINT [ "node", "./src/app.js" ]