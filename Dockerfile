FROM node:14.5.0
LABEL maintainer="ezPAARSE Team <ezpaarse@couperin.org>"

ENV NODE_ENV production

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install && npm cache clean --force
COPY . /usr/src/app

EXPOSE 8080
CMD [ "npm", "start" ]