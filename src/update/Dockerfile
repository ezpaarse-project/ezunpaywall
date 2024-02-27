FROM node:18.19.1-alpine3.19
LABEL maintainer="ezTeam <ezteam@couperin.org>"

EXPOSE 3000

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

CMD [ "npm", "start" ]