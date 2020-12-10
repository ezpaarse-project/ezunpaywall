FROM node:14.5.0
LABEL maintainer="ezPAARSE Team <ezpaarse@couperin.org>"

ENV NODE_ENV production

RUN mkdir -p /usr/src/api
WORKDIR /usr/src/api

COPY package.json /usr/src/api/
RUN npm install && npm cache clean --force
COPY . /usr/src/api

EXPOSE 8080
CMD [ "npm", "start" ]