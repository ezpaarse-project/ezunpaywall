# ezunpaywall-health

Health service indicating the status of the connection between each service.

## Service environment variables

| name | default | description |
| --- | --- | --- |
| GRAPHQL_HOST | http://graphql:3000 | graphql host |
| GRAPHQL_HOST | http://enrich:3000 | enrich host |
| GRAPHQL_HOST | http://update:3000 | update host |
| GRAPHQL_HOST | http://apikey:3000 | apikey host |
| GRAPHQL_HOST | http://mail:3000 | mail host |
| ELASTICSEARCH_URL | http://elastic:changeme@elastic:9200 | elasticsearch host with login and password |
| REDIS_HOST | redis | redis host |
| REDIS_PORT | 6379 | redis port |
| REDIS_PASSWORD | changeme | redis password |
| UNPAYWALL_HOST | http://fakeUnpaywall:3000 | unpaywall host |
| UNPAYWALL_APIKEY | default | unpaywall apikey |


## Docker environment variables

| name | default | description |
| --- | --- | --- |
| HEALTH_APPLICATION_LOG_PATH | ./src/health/log/application | application output log path |
| HEALTH_PORT | 59707 | output port |