FROM node:18.19.1-alpine3.19
LABEL maintainer="ezTeam <ezteam@couperin.org>"

EXPOSE 3000

ARG NODE_ENV production

ENV TIMEZONE=${TIMEZONE} \
  \
  REDIS_HOST=${REDIS_HOST} \
  REDIS_PORT=${REDIS_PORT} \
  REDIS_PASSWORD=${REDIS_PASSWORD} \
  \
  GRAPHQL_URL=${GRAPHQL_URL} \
  HEALTH_TIMEOUT=${HEALTH_TIMEOUT} 

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

HEALTHCHECK --interval=1m --timeout=10s --retries=5 --start-period=20s \
  CMD wget -Y off --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

ENTRYPOINT [ "npm", "start" ]