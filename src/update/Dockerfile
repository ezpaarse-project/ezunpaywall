FROM node:14.15.5-alpine3.13
LABEL maintainer="ezTeam <ezteam@couperin.org>"

ENV NODE_ENV production

WORKDIR /usr/src/update

COPY package*.json /usr/src/update/
RUN npm ci --only=production
COPY . /usr/src/update

EXPOSE 4000
CMD [ "npm", "start" ]