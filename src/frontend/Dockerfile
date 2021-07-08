FROM node:14.15.5-alpine3.13
LABEL maintainer="ezTeam <ezteam@couperin.org>"

ENV NODE_ENV production

RUN mkdir -p /usr/src/frontend
WORKDIR /usr/src/frontend

COPY package.json /usr/src/frontend/
RUN npm install && npm cache clean --force
COPY . /usr/src/frontend

RUN npm run build

EXPOSE 8080
CMD [ "npm", "start" ]