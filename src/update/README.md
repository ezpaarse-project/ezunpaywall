# ezunpaywall-health

Health service indicating the status of the connection between each service.

## Service environment variables

| name | default | description |
| --- | --- | --- |
| NODE_ENV | development | environnement of node |
| UNPAYWALL_HOST | http://fakeunpaywall:3000 | unpaywall api host to access to changefiles |
| UNPAYWALL_APIKEY | changeme | unpaywall apikey to access to changefiles |
| MAIL_HOST | http://mail:3000 | mail service host |
| MAIL_APIKEY | changeme | mail apikey |
| ELASTICSEARCH_HOSTS | http://elastic | elastic host |
| ELASTICSEARCH_PORT | 9200 | elastic port |
| ELASTICSEARCH_USERNAME | elastic | username of elastic super user |
| ELASTICSEARCH_PASSWORD | changeme | password of elastic super user |
| ELASTICSEARCH_MAX_BULK_SIZE | 4000 | max bulk size of update process |
| ELASTICSEARCH_INDEX_ALIAS | upw | default alias of unpaywall data |
| UPDATE_CRON_SCHEDULE | 0 0 0 * * * | schedule of cron |
| UPDATE_CRON_ACTIVE | false | state of cron |
| UPDATE_CRON_INDEX | unpaywall | index of update process of cron |
| UPDATE_CRON_INTERVAL | day | interval of update process of cron |
| UPDATE_APIKEY | changeme | update apikey to start update process |
| HEALTH_TIMEOUT | 3000 | timeout to query the health route |