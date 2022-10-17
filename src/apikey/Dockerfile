FROM node:14.15.5-alpine3.13
LABEL maintainer="ezTeam <ezteam@couperin.org>"

ENV NODE_ENV production

WORKDIR /apikey

COPY package*.json /apikey/
RUN npm ci --no-optional --only=production
COPY . /apikey

EXPOSE 7000
CMD [ "npm", "start" ]