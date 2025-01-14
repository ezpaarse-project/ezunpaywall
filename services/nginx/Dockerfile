FROM nginx:1.27.2-alpine-slim

COPY templates/http.conf.template /etc/nginx/templates/default.conf.template

ARG ENV=development

HEALTHCHECK --interval=15s --timeout=10s --retries=5 --start-period=20s \
  CMD wget -Y off --no-verbose --tries=1 --spider http://localhost:80 || exit 1

RUN if [ "$ENV" = "production" ]; then \
      rm -f /bin/bash /bin/sh; \
    fi

USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]