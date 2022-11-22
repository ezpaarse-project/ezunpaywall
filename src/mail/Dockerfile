FROM node:14.15.5-alpine3.13
LABEL maintainer="ezTeam <ezteam@couperin.org>"

ENV NODE_ENV production

WORKDIR /mail

COPY package*.json /mail/
RUN npm ci --only=production
COPY . /mail

CMD [ "npm", "start" ]