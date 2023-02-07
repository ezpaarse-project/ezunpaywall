# ezunpaywall-enrich

csv and jsonl file enrichment service with unpaywall data.

## Service environment variables

| name | default | description |
| --- | --- | --- |
| NODE_ENV | development | environment of node |
| ACCESS_LOG_ROTATE | false | Set to true if you want to use access log rotation |
| REDIS_HOST | redis | redis host |
| REDIS_PORT | 6379 | redis port |
| REDIS_PASSWORD | changeme | redis password |


## Docker environment variables

| name | default | description |
| --- | --- | --- |
| ENRICH_APPLICATION_LOG_PATH | ./src/enrich/log/application | application output log path |
| ENRICH_ACCESS_LOG_PATH | ./src/enrich/log/access | access log output path |
| ENRICH_DATA_PATH | ./src/enrich/data | access data output path |
| ENRICH_PORT | 59703 | output port |