# ezunpaywall-health

Service that verify that all its services are working and communicating well together.

## Config

To set up this service, you can use environment variables. The config is displayed at startup. Sensitive data are not displayed.

```
# if sensitive data are not updated
warn: [config]: Redis password has the default value
warn: [config]: Elastic password has the default value
warn: [config]: Unpaywall apikey has the default value

info: {
  "nodeEnv": "development",
  "graphqlHost": "http://graphql:3000",
  "updateHost": "http://update:3000",
  "enrichHost": "http://enrich:3000",
  "apikeyHost": "http://apikey:3000",
  "mailHost": "http://mail:3000",
  "elasticsearch": {
    "host": "http://elastic",
    "port": 9200,
    "user": "elastic",
    "password": "********"
  },
  "redis": {
    "host": "redis",
    "port": "6379",
    "password": "********"
  },
  "healthTimeout": 3000
}
```

## Environment variables

| name | default | description |
| --- | --- | --- |
| NODE_ENV | development | environment of node |
| GRAPHQL_HOST | http://graphql:3000 | graphql host |
| ENRICH_HOST | http://enrich:3000 | enrich host |
| UPDATE_HOST | http://update:3000 | update host |
| APIKEY_HOST | http://apikey:3000 | apikey host |
| MAIL_HOST | http://mail:3000 | mail host |
| ELASTICSEARCH_HOSTS | http://elastic | elasticsearch host |
| ELASTICSEARCH_PORT | 9200 | elasticsearch port |
| ELASTICSEARCH_USERNAME | elastic | elasticsearch admin username |
| ELASTICSEARCH_PASSWORD | changeme | elasticsearch admin password |
| REDIS_HOST | redis | redis host |
| REDIS_PORT | 6379 | redis port |
| REDIS_PASSWORD | changeme | redis password |
| HEALTH_TIMEOUT | 3000 | timeout to query the health route |