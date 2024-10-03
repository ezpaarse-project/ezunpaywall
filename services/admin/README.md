# ezunpaywall-admin

Admin service to manage API keys to access to graphql and enrich service.
This service manage unpaywall data with cron job.
During the job, a state allows you to monitor the current job.
This service is for administrators.

## Config

To set up this service, you can use environment variables. The config is displayed at startup. Sensitive data are not displayed.

```
# if sensitive data are not updated
2024-08-19T12:48:37.898Z warn: [config]: Unpaywall apikey has the default value 
2024-08-19T12:48:37.899Z warn: [config]: Elasticsearch password has the default value 
2024-08-19T12:48:37.899Z warn: [config]: Apikey has the default value 
2024-08-19T12:48:37.899Z warn: [config]: Redis password has the default value

2024-08-19T12:48:37.899Z info: {
  "nodeEnv": "development",
  "timezone": "Europe/Paris",
  "smtp": {
    "host": "maildev",
    "port": 25
  },
  "notifications": {
    "sender": "ezunpaywall",
    "receivers": [
      "ezunpaywall@example.fr"
    ],
    "machine": "dev"
  },
  "unpaywall": {
    "url": "http://fakeunpaywall:3000",
    "apikey": "********"
  },
  "elasticsearch": {
    "nodes": "http://elastic:9200",
    "username": "elastic",
    "password": "********",
    "maxBulkSize": 4000,
    "indexAlias": "upw",
    "timeout": 20000
  },
  "redis": {
    "host": "redis",
    "port": "6379",
    "password": "********"
  },
  "cron": {
    "downloadSnapshot": {
      "schedule": "0 0 0 1 * *",
      "active": true,
    },
    "dataUpdate": {
      "schedule": "0 0 0 * * *",
      "active": false,
      "index": "unpaywall",
      "interval": "day"
    },
    "dataUpdateHistory": {
      "schedule": "0 0 0 * * *",
      "active": true,
      "indexBase": "unpaywall-base",
      "indexHistory": "unpaywall-history",
      "interval": "day"
    },
    "cleanFile": {
      "schedule": "0 0 0 * * *",
      "active": true,
      "changefileThreshold": 30,
      "reportThreshold": 30,
      "snapshotThreshold": 150
    }
  },
  "paths": {
    "log": {
      "applicationDir": "./log/application",
      "accessDir": "./log/access",
      "healthCheckDir": "./log/healthcheck"
    },
    "data": {
      "changefilesDir": "./data/changefiles",
      "snapshotsDir": "./data/snapshots",
      "reportsDir": "./data/reports"
    }
  },
  "apikey": "********",
  "healthTimeout": 3000
} 

## Environment variables

| name | default | description |
| --- | --- | --- |
| NODE_ENV | development | environment of node |
| TIMEZONE | Europe/Paris | timezone of app used in cron |
| SMTP_HOST | localhost | SMTP host |
| SMTP_PORT | 25 | SMTP port |
| NOTIFICATIONS_SENDER | ezunpaywall | the sender for emails issued by ezunpaywall |
| NOTIFICATIONS_RECEIVERS | ezunpaywall@example.fr" | recipients of the recent activity email |
| NOTIFICATIONS_MACHINE | dev | environment of machine |
| UNPAYWALL_URL | http://fakeunpaywall:3000 | unpaywall api URL to access to changefiles |
| UNPAYWALL_APIKEY | changeme | unpaywall apikey to access to changefiles |
| ELASTICSEARCH_NODES | http://elastic:9200 | elastic nodes URL separated by comma |
| ELASTICSEARCH_USERNAME | elastic | username of elastic super user |
| ELASTICSEARCH_PASSWORD | changeme | password of elastic super user |
| ELASTICSEARCH_MAX_BULK_SIZE | 4000 | max bulk size of update process |
| ELASTICSEARCH_INDEX_ALIAS | upw | default alias of unpaywall data |
| ELASTICSEARCH_TIMEOUT | 20000 | timeout in mineseconds of elastic client |
| REDIS_HOST | redis | redis host |
| REDIS_PORT | 6379 | redis port |
| REDIS_PASSWORD | changeme | redis password |
| CRON_DOWNLOAD_SNAPSHOT_SCHEDULE | 0 0 0 1 * * | schedule of cron |
| CRON_DOWNLOAD_SNAPSHOT_ACTIVE | true | cron active or not at the start of service |
| CRON_DATA_UPDATE_SCHEDULE | 0 0 0 * * * | schedule of cron |
| CRON_DATA_UPDATE_ACTIVE | false | cron active or not at the start of service |
| CRON_DATA_UPDATE_INDEX | unpaywall | index where data is inserted |
| CRON_DATA_UPDATE_INTERVAL | day | interval of changefile |
| CRON_DATA_UPDATE_HISTORY_SCHEDULE | 0 0 0 * * * | schedule of cron |
| CRON_DATA_UPDATE_HISTORY_ACTIVE | true | cron active or not at the start of service |
| CRON_DATA_UPDATE_HISTORY_INDEX_BASE | unpaywall-base | index where data is inserted |
| CRON_DATA_UPDATE_HISTORY_INDEX_HISTORY | unpaywall-history | index where history data is inserted |
| CRON_DATA_UPDATE_HISTORY_INTERVAL | day | interval of changefile |
| CRON_CLEAN_FILE_SCHEDULE | "0 0 0 * * * | schedule of cron |
| CRON_CLEAN_FILE_ACTIVE | true | cron active or not at the start of service |
| CRON_CLEAN_FILE_CHANGEFILE_THRESHOLD | 30 | detention time in days |
| CRON_CLEAN_FILE_REPORT_THRESHOLD | 30 | detention time in days |
| CRON_CLEAN_FILE_SNAPSHOT_THRESHOLD | 150 | detention time in days |
| ADMIN_APIKEY | changeme | admin API key |
| HEALTH_TIMEOUT | 3000 | timeout to query the health route |

## Cron

One cron automatically reset the counter at 100 000 of demo API key.

## Log format

```
:date :ip :method :url :statusCode :userAgent :responseTime
```

## Open API

[open-api documentation](https://unpaywall.inist.fr/open-api?doc=admin)

## Test

```
# Functional tests
npm run test
# Unit test
# it's your turn to play
```