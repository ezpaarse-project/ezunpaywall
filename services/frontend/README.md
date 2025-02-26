# ezunpaywall-frontend

Web interface for :
- Show metrics on unpaywall data
- Examples of how to use the graphql API and enrichment service
-openAPI documentation
- A contact form
- A server administration section
- A history of data update reports.

## Environment variables

| name | description | default |
| --- | --- | --- |
| NUXT_PUBLIC_ENVIRONMENT | Environment of node | development |
| NUXT_PUBLIC_UNPAYWALL_URL | URL of unpaywall | https://unpaywall.org |
| NUXT_PUBLIC_UNPAYWALL_API_URL | URL of API of unpaywall | http://api.unpaywall.org |
| NUXT_PUBLIC_DASHBOARD_URL | URL of ezmesure dashboard | https://ezmesure.couperin.org/kibana/s/ezunpaywall/app/dashboards |
| NUXT_PUBLIC_GRAPHQL_URL | URL of ezunpaywall graphql service | http://localhost:59701 |
| NUXT_PUBLIC_ADMIN_URL | URL of ezunpaywall admin service | http://localhost:59702 |
| NUXT_PUBLIC_ENRICH_URL | URL of ezunpaywall enrich service | http://localhost:59703 |
| NUXT_PUBLIC_ELASTIC_ENV | version of elastic | development |
| NUXT_PUBLIC_VERSION | Version displayed on frontend | development |
| NUXT_ADMIN_APIKEY | Apikey to send mail of mail service | changeme |
| NUXT_ADMIN_URL | URL of ezunpaywall mail service | http://localhost:59705 |
| PORT | Port | 3000 |

