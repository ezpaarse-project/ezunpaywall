# ezunpaywall-nginx

Entry point and reverse proxy that redirecting all services of ezunpaywall.

## Environment variables

| Name | Description | Default |
| --- | --- | --- |
| FRONTEND_URL | frontend URL | "" | 
| GRAPHQL_URL | graphql URL | "" |
| ADMIN_URL | update URL | "" |
| ENRICH_URL | enrich URL | "" |
| NGINX_HOST | nginx host | "" |
| NGINX_PORT | output port | 80 |

## Command to set volume permissions (non root image docker)

```sh
docker compose run --rm --entrypoint "" --user root nginx chown -R nginx /var/log/nginx/
```