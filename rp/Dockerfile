FROM node:14.15.5-alpine3.13 AS client
LABEL maintainer="ezTEAM <ezteam@couperin.org>"
ARG API_URL
ENV NODE_ENV production
WORKDIR /usr/src/client
COPY ./client/package.json /usr/src/client/
RUN npm install && npm cache clean --force
COPY ./client/ /usr/src/client/
RUN npm run generate

# FROM node:14.15.5-alpine3.13 AS doc
# LABEL maintainer="ezTEAM <ezteam@couperin.org>"
# ARG API_URL
# ENV NODE_ENV production
# WORKDIR /usr/src/doc
# COPY ./doc/package.json /usr/src/doc/
# RUN npm install && npm cache clean --force
# COPY ./doc/ /usr/src/doc/
# RUN npm run build

FROM nginx:1.20.1-alpine
COPY --from=client /usr/src/client/dist /usr/share/nginx/html
# COPY --from=doc /usr/src/doc/dist /usr/share/nginx/html