FROM nginx:1.25.2-alpine-slim

COPY templates/http.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

HEALTHCHECK --interval=1m --timeout=10s --retries=5 --start-period=20s \
  CMD service nginx status || exit 1

CMD ["nginx", "-g", "daemon off;"]