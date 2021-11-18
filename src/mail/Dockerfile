FROM node:14.15.5-alpine3.13
LABEL maintainer="ezTeam <ezteam@couperin.org>"

ENV NODE_ENV production

WORKDIR /usr/src/mail

COPY package*.json /usr/src/mail/
RUN npm ci --only=production
COPY . /usr/src/mail

EXPOSE 8000
CMD [ "npm", "start" ]