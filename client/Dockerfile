FROM node:14.15.4
LABEL maintainer="ezUNPAYWALL client Team <ezpaarse@couperin.org>"

ENV NODE_ENV production

RUN mkdir -p /usr/src/client
WORKDIR /usr/src/client

COPY package.json /usr/src/client/
RUN npm install && npm cache clean --force
COPY . /usr/src/client

RUN npm run build

EXPOSE 3000
CMD [ "npm", "start" ]