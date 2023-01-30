FROM node:18.12-alpine3.17
LABEL maintainer="ezTeam <ezteam@couperin.org>"

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY package*.json /usr/src/app/
RUN npm ci --only=production
COPY . /usr/src/app

CMD [ "npm", "start" ]