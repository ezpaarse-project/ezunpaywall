# ezunpaywall-graphql

unpaywall data access service

## Service environment variables

| name | default | description |
| --- | --- | --- |
| NODE_ENV | development | environment of node |
| REDIS_HOST | redis | redis host |
| REDIS_PORT | 6379 | redis port |
| REDIS_PASSWORD | changeme | redis password |
| ELASTICSEARCH_HOSTS | http://elastic | elasticsearch host |
| ELASTICSEARCH_PORT | 9200 | elasticsearch port |
| ELASTICSEARCH_USERNAME | elastic | elasticsearch admin username |
| ELASTICSEARCH_PASSWORD | changeme | elasticsearch admin password |
| ELASTICSEARCH_INDEX_ALIAS | upw | graphql entry point |

## Docker environment variables

| name | default | description |
| GRAPHQL_APPLICATION_LOG_PATH | ./src/graphql/log/application | application output log path |
| GRAPHQL_ACCESS_LOG_PATH | ./src/graphql/log/access | access log output path |
| GRAPHQL_PORT | 59701 | output port |