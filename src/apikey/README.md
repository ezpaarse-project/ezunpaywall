# ezunpaywall-apikey

API key management service for update, graphql and enrich service.

## Service environment variables

| name | default | description |
| --- | --- | --- |
| NODE_ENV | development | environment of node |
| ACCESS_LOG_ROTATE | false | Set to true if you want to use access log rotation |
| REDIS_HOST | redis | redis host |
| REDIS_PORT | 6379 | redis port |
| REDIS_PASSWORD | changeme | redis password |
| HEALTH_TIMEOUT | 3000 | timeout to query the health route |