FROM nginx:1.27.2-alpine-slim

COPY templates/http.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

HEALTHCHECK --interval=1m --timeout=10s --retries=5 --start-period=20s \
  CMD wget -Y off --no-verbose --tries=1 --spider http://localhost:80 || exit 1

ENTRYPOINT ["nginx", "-g", "daemon off;"]