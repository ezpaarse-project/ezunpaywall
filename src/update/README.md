# ezunpaywall-health

Health service indicating the status of the connection between each service.

## Service environment variables

| name | default | description |
| --- | --- | --- |
| NODE_ENV | development | environnement of node |
| UNPAYWALL_HOST | http://fakeunpaywall:3000 | unpaywall api host to access to changefiles |
| UNPAYWALL_APIKEY | changeme | unpaywall apikey to access to changefiles |
| ELASTICSEARCH_HOSTS | http://elastic | elastic host |
| ELASTICSEARCH_PORT | 9200 | elastic port |
| ELASTICSEARCH_USERNAME | elastic | username of elastic super user |
| ELASTICSEARCH_PASSWORD | changeme | password of elastic super user |
| ELASTICSEARCH_MAX_BULK_SIZE | 4000 | max bulk size of update process |
| ELASTICSEARCH_INDEX_ALIAS | upw | default alias of unpaywall data |
| MAIL_HOST | http://mail:3000 | mail service host |
| MAIL_APIKEY | changeme | mail apikey |

## Docker environment variables

| name | default | description |
| --- | --- | --- |
| UPDATE_APPLICATION_LOG_PATH | ./src/update/log/application | application output log path |
| UPDATE_ACCESS_LOG_PATH | ./src/update/log/access | access log output path |
| UPDATE_DATA_PATH | ./src/update/data | access data output path |
| UPDATE_PORT | 59702 | output port |