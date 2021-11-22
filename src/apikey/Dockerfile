FROM node:14.15.5-alpine3.13
LABEL maintainer="ezTeam <ezteam@couperin.org>"

ENV NODE_ENV production

WORKDIR /usr/src/apikey

COPY package*.json /usr/src/apikey/
RUN npm ci --only=production
COPY . /usr/src/apikey

EXPOSE 7000
CMD [ "npm", "start" ]