FROM node:18.12.0-alpine3.13
LABEL maintainer="ezTeam <ezteam@couperin.org>"

ENV NODE_ENV production

WORKDIR /health

COPY package*.json /health/
RUN npm ci --only=production
COPY . /health

CMD [ "npm", "start" ]