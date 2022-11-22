FROM node:14.15.5-alpine3.13
LABEL maintainer="ezTeam <ezteam@couperin.org>"

ENV NODE_ENV production

WORKDIR /update

COPY package*.json /update/
RUN npm ci --only=production
COPY . /update

CMD [ "npm", "start" ]