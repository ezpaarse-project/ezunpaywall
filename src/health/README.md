# ezunpaywall-health

Health service indicating the status of the connection between each service.

## Service environment variables

| name | default | description |
| --- | --- | --- |
| GRAPHQL_HOST | http://graphql:3000 | graphql host |
| ENRICH_HOST | http://enrich:3000 | enrich host |
| UPDATE_HOST | http://update:3000 | update host |
| APIKEY_HOST | http://apikey:3000 | apikey host |
| MAIL_HOST | http://mail:3000 | mail host |
| ELASTICSEARCH_HOSTS | http://elastic | elasticsearch host |
| ELASTICSEARCH_PORT | 9200 | elasticsearch port |
| ELASTICSEARCH_USERNAME | elastic | elasticsearch admin username |
| ELASTICSEARCH_PASSWORD | changeme | elasticsearch admin password |
| REDIS_HOST | redis | redis host |
| REDIS_PORT | 6379 | redis port |
| REDIS_PASSWORD | changeme | redis password |
| UNPAYWALL_HOST | http://fakeUnpaywall:3000 | unpaywall host |
| UNPAYWALL_APIKEY | default | unpaywall apikey |
| HEALTH_TIMEOUT | 3000 | timeout to query the health route |