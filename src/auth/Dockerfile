FROM node:14.15.5-alpine3.13
LABEL maintainer="ezTeam <ezteam@couperin.org>"

ENV NODE_ENV production

WORKDIR /usr/src/auth

COPY package*.json /usr/src/auth/
RUN npm ci --only=production
COPY . /usr/src/auth

EXPOSE 6000
CMD [ "npm", "start" ]