# ezunpaywall-apikey

API key management service for update, graphql and enrich service.

## Service environment variables

| name | default | description |
| --- | --- | --- |
| NODE_ENV | development | environment of node |
| REDIS_HOST | redis | redis host |
| REDIS_PORT | 6379 | redis port |
| REDIS_PASSWORD | changeme | redis password |

## Docker environment variables

| name | default | description |
| APIKEY_APPLICATION_LOG_PATH | ezunpaywall/src/apikey/log/application | application output log path |
| APIKEY_ACCESS_LOG_PATH | ezunpaywall/src/apikey/log/access | access log output path |
| APIKEY_PORT | 59704 | output port |