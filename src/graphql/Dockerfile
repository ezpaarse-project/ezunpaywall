FROM node:14.15.5-alpine3.13
LABEL maintainer="ezTeam <ezteam@couperin.org>"

ENV NODE_ENV production

WORKDIR /usr/src/graphql

COPY package*.json /usr/src/graphql/
RUN npm ci --only=production
COPY . /usr/src/graphql

EXPOSE 3000
CMD [ "npm", "start" ]