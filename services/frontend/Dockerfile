FROM node:22.13.1-alpine3.21 AS base

LABEL maintainer="ezTeam <ezteam@couperin.org>"

FROM base AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/.output /usr/src/app

ARG ENV=development
ENV PORT=3000

HEALTHCHECK --interval=15s --timeout=10s --retries=5 --start-period=20s CMD ["node", "./healthcheck.js"]

RUN if [ "$ENV" = "production" ]; then \
      rm -f /bin/sh; \
    fi

USER node

EXPOSE $PORT

ENTRYPOINT [ "node", "/usr/src/app/server/index.mjs" ]