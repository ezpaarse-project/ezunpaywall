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
| NUXT_PUBLIC_UNPAYWALL_HOST | https://unpaywall.org | Host of unpaywall |
| NUXT_PUBLIC_UNPAYWALL_API_HOST | http://api.unpaywall.org | Host of API of unpaywall |
| NUXT_PUBLIC_DASHBOARD_HOST | https://ezmesure.couperin.org/kibana/s/ezunpaywall/app/dashboards | Host of ezmesure dashboard |
| NUXT_PUBLIC_GRAPHQL_HOST | http://localhost:59701 | Host of ezunpaywall graphql service |
| NUXT_PUBLIC_UPDATE_HOST | http://localhost:59702 | Host of ezunpaywall update service |
| NUXT_PUBLIC_ENRICH_HOST | http://localhost:59703 | Host of ezunpaywall enrich service |
| NUXT_PUBLIC_APIKEY_HOST | http://localhost:59704 | Host of ezunpaywall apikey service |
| NUXT_MAIL_APIKEY | changeme | Apikey to send mail of mail service |
| NUXT_MAIL_HOST | http://localhost:59705 | Host of ezunpaywall mail service |
| NUXT_PUBLIC_HEALTH_HOST | http://localhost:59707 | Host of ezunpaywall health service |
| NUXT_PUBLIC_ELASTIC_ENV | development | version of elastic |
| NUXT_PUBLIC_VERSION | development | version displayed on frontend |

