FROM node:18.12-alpine3.17
LABEL maintainer="ezTeam <ezteam@couperin.org>"

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY package*.json /usr/src/app/
RUN RUN npm ci --omit=dev
COPY . /usr/src/app

CMD [ "npm", "start" ]