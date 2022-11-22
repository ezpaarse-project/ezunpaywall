FROM node:14.15.5-alpine3.13
LABEL maintainer="ezTeam <ezteam@couperin.org>"

ENV NODE_ENV production

WORKDIR /enrich

COPY package*.json /enrich/
RUN npm ci --only=production
COPY . /enrich

CMD [ "npm", "start" ]