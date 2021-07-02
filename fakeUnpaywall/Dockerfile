FROM node:14.15.5-alpine3.13
LABEL maintainer="ezTeam <ezteam@couperin.org>"

ENV NODE_ENV production

WORKDIR /usr/src/api

COPY package.json /usr/src/api/
RUN npm install && npm cache clean --force
COPY . /usr/src/api

EXPOSE 12000
CMD [ "npm", "start" ]