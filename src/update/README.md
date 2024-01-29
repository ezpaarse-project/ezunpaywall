# ezunpaywall-health

Health service indicating the status of the connection between each service.

## Service environment variables

| name | default | description |
| --- | --- | --- |
| NODE_ENV | development | environnement of node |
| ACCESS_LOG_ROTATE | false | use local daily rotation for log |
| TIMEZONE | Europe/Paris | timezone of app used in cron |
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
| UNPAYWALL_CRON_SCHEDULE | 0 0 0 * * * | schedule of unpaywall cron |

| UNPAYWALL_CRON_ACTIVE | false | state of unpaywall cron |
| UNPAYWALL_CRON_INDEX | unpaywall | index of unpaywall process of cron |
| UNPAYWALL_CRON_INTERVAL | day | interval of unpaywall process of cron |
| UNPAYWALL_HISTORY_CRON_SCHEDULE | 0 0 0 * * * | schedule of unpaywall history cron |
| UNPAYWALL_HISTORY_CRON_TIMEZONE | Europe/Paris | timezone for schedule of unpaywall cron |
| UNPAYWALL_HISTORY_CRON_ACTIVE | false | state of unpaywall history cron |
| UNPAYWALL_HISTORY_CRON_INDEX | unpaywall | index of unpaywall history process of cron |
| UNPAYWALL_HISTORY_CRON_INTERVAL | day | interval of unpaywall history process of cron |
| UPDATE_APIKEY | changeme | update apikey to start update process |
| HEALTH_TIMEOUT | 3000 | timeout to query the health route |