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
      "ezunpaywall@example.com"
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
      "index": "unpaywall",
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
  "apikey": "********",
  "healthTimeout": 3000,
  "port": 3003,
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
  }
}
```

## Environment variables

| name | Description | Default |
| --- | --- | --- |
| NODE_ENV | Environment of node | development |
| TIMEZONE | Timezone of app used in cron | Europe/Paris |
| SMTP_HOST | SMTP host | localhost |
| SMTP_PORT | SMTP port | 25 |
| NOTIFICATIONS_SENDER | The sender for emails issued by ezunpaywall | ezunpaywall |
| NOTIFICATIONS_RECEIVERS | Recipients of the recent activity email | ezunpaywall@example.fr |
| NOTIFICATIONS_MACHINE | Environment of machine | dev |
| UNPAYWALL_URL | Unpaywall API URL to access to changefiles | http://fakeunpaywall:3000 |
| UNPAYWALL_APIKEY | Unpaywall apikey to access to changefiles | changeme |
| ELASTICSEARCH_NODES | Elastic nodes URL separated by comma | http://elastic:9200 |
| ELASTICSEARCH_USERNAME | Username of elastic super user | elastic |
| ELASTICSEARCH_PASSWORD | Password of elastic super user | changeme |
| ELASTICSEARCH_MAX_BULK_SIZE | Max bulk size of update process | 4000 |
| ELASTICSEARCH_INDEX_ALIAS | Default alias of unpaywall data | upw |
| ELASTICSEARCH_TIMEOUT | Timeout in milliseconds of elastic client | 20000 |
| REDIS_HOST | Redis host | redis |
| REDIS_PORT | Redis port | 6379 |
| REDIS_PASSWORD | Redis password | changeme |
| CRON_DOWNLOAD_SNAPSHOT_SCHEDULE | Schedule of cron | 0 0 0 1 * * |
| CRON_DOWNLOAD_SNAPSHOT_ACTIVE | Cron active or not at the start of service | true |
| CRON_DATA_UPDATE_SCHEDULE | Schedule of cron | 0 0 0 * * * |
| CRON_DATA_UPDATE_ACTIVE | Cron active or not at the start of service | false |
| CRON_DATA_UPDATE_INDEX | Index where data is inserted | unpaywall |
| CRON_DATA_UPDATE_INTERVAL | Interval of changefile | day |
| CRON_DATA_UPDATE_HISTORY_SCHEDULE | Schedule of cron | 0 0 0 * * * |
| CRON_DATA_UPDATE_HISTORY_ACTIVE | Cron active or not at the start of service | true |
| CRON_DATA_UPDATE_HISTORY_INDEX | Index where data is inserted | unpaywall-base |
| CRON_DATA_UPDATE_HISTORY_INDEX_HISTORY | Index where history data is inserted | unpaywall-history |
| CRON_DATA_UPDATE_HISTORY_INTERVAL | Interval of changefile | day |
| CRON_CLEAN_FILE_SCHEDULE | Schedule of cron | 0 0 0 * * * |
| CRON_CLEAN_FILE_ACTIVE | Cron active or not at the start of service | true |
| CRON_CLEAN_FILE_CHANGEFILE_THRESHOLD | Detention time in days | 30 |
| CRON_CLEAN_FILE_REPORT_THRESHOLD | Detention time in days | 30 |
| CRON_CLEAN_FILE_SNAPSHOT_THRESHOLD | Detention time in days | 150 |
| ADMIN_APIKEY | Admin API key | changeme |
| HEALTH_TIMEOUT | Timeout to query the health route | 3000 |
| PORT | Port | 3000 |

## Command to set volume permissions (non root image docker)

```sh
docker compose run --rm --entrypoint "" --user node admin chown -R node /usr/src/app/log
docker compose run --rm --entrypoint "" --user node admin chown -R node /usr/src/app/data
```

## Activity diagram

Update process

![Activity-diagram](./docs/update-activity-diagram.png)

## Data

3 types of file is generated by update job :
- changefile from unpaywall
- snapshot from unpaywall
- reports generated at the end of process

They are structured like this
```
data
├── changefiles
│   ├── changefile1.jsonl.gz
│   ├── ...
│   └── changefile3.jsonl.gz
├── snapshots
│   ├── snapshot1.jsonl.gz
│   ├── ...
│   └── snapshot3.jsonl.gz
└── reports
    ├── report1.jsonl.gz
    ├── ...
    └── report3.jsonl.gz
```

## Cron

- Demo apikey : Reset the counter at 100 000 of demo API key.
- Data update : Starts the data update process.
- Data history update : Starts the data update process and feeds the history.
- Clean File : Deletes files generated by updates after a certain period of time.

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

# Unit tests
# TODO
```