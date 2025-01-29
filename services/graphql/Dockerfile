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
ENV PORT=3000

HEALTHCHECK --interval=15s --timeout=10s --retries=5 --start-period=20s CMD ["node", "./healthcheck.js"]

RUN mkdir -p ./log/access ./log/application ./log/healthcheck  \
  && chmod -R 700 ./log \
  && chown -R node:node ./log

RUN if [ "$ENV" = "production" ]; then \
      rm -f /bin/sh; \
    fi

USER node

EXPOSE $PORT

ENTRYPOINT [ "node", "./src/app.js" ]