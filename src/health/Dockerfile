FROM node:18.12-alpine3.17
LABEL maintainer="ezTeam <ezteam@couperin.org>"

ENV NODE_ENV production

WORKDIR /health

COPY package*.json /health/
RUN npm ci --only=production
COPY . /health

CMD [ "npm", "start" ]