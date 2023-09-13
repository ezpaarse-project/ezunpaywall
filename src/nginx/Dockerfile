FROM nginx:1.25.2-alpine-slim

COPY templates/http.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]