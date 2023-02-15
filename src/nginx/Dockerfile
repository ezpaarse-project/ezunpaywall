FROM nginx:1.23.3-alpine-slim

COPY templates/http.conf.template /etc/nginx/templates/default.conf.template:ro

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]