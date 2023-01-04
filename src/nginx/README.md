# ezunpaywall-health

Entry point and reverse proxy of ezunpaywall.

## Docker environment variables

| name | default | description |
| --- | --- | --- |
| NGINX_CONFIG_PATH | ./src/nginx/log/application | nginx config path |
| NGINX_ACCESS_LOG_PATH | ./src/nginx/log/access | access log output path |
| NGINX_PORT | 80 | output port |