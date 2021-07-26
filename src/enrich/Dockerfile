FROM node:14.15.5-alpine3.13
LABEL maintainer="ezTeam <ezteam@couperin.org>"

ENV NODE_ENV production

WORKDIR /usr/src/enrich

COPY package*.json /usr/src/enrich/
RUN npm ci --only=production
COPY . /usr/src/enrich

EXPOSE 5000
CMD [ "npm", "start" ]