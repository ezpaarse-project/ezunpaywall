FROM node:14.15.5-alpine3.13
LABEL maintainer="ezTeam <ezteam@couperin.org>"

ENV NODE_ENV production

WORKDIR /graphql

COPY package*.json /graphql/
RUN npm ci --only=production
COPY . /graphql

CMD [ "npm", "start" ]