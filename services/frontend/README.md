# ezunpaywall-frontend

Web interface for :
- Show metrics on unpaywall data
- Examples of how to use the graphql API and enrichment service
-openAPI documentation
- A contact form
- A server administration section
- A history of data update reports.

## Environment variables

| name | default | description |
| --- | --- | --- |
| NUXT_PUBLIC_ENVIRONMENT | development | environment of node |
| NUXT_PUBLIC_UNPAYWALL_URL | https://unpaywall.org | URL of unpaywall |
| NUXT_PUBLIC_UNPAYWALL_API_URL | http://api.unpaywall.org | URL of API of unpaywall |
| NUXT_PUBLIC_DASHBOARD_URL | https://ezmesure.couperin.org/kibana/s/ezunpaywall/app/dashboards | URL of ezmesure dashboard |
| NUXT_PUBLIC_GRAPHQL_URL | http://localhost:59701 | URL of ezunpaywall graphql service |
| NUXT_PUBLIC_ADMIN_URL | http://localhost:59702 | URL of ezunpaywall admin service |
| NUXT_PUBLIC_ENRICH_URL | http://localhost:59703 | URL of ezunpaywall enrich service |
| NUXT_ADMIN_APIKEY | changeme | Apikey to send mail of mail service |
| NUXT_ADMIN_URL | http://localhost:59705 | URL of ezunpaywall mail service |
| NUXT_PUBLIC_ELASTIC_ENV | development | version of elastic |
| NUXT_PUBLIC_VERSION | development | version displayed on frontend |

