# ezunpaywall-apikey

API key management service for access to graphql and enrich service.
This service is for administrators.

## Config

To set up this service, you can use environment variables. The config is displayed at startup. Sensitive data are not displayed.

```
# if sensitive data are not updated
warn: [config]: Apikey has the default value 
warn: [config]: Redis password has the default value

info: {
  "nodeEnv": "development",
  "accessLogRotate": false,
  "timezone": "Europe/Paris"
  "redis": {
    "host": "redis",
    "port": "6379",
    "password": "********"
  },
  "apikey": "********",
  "healthTimeout": 3000
}
```

## Environment variables

| name | default | description |
| --- | --- | --- |
| NODE_ENV | development | environment of node |
| ACCESS_LOG_ROTATE | false | Set to true if you want to use access log rotation |
| TIMEZONE | Europe/Paris | timezone of app used in cron |
| REDIS_HOST | redis | redis host |
| REDIS_PORT | 6379 | redis port |
| REDIS_PASSWORD | changeme | redis password |
| ADMIN_APIKEY | changeme | admin API key |
| HEALTH_TIMEOUT | 3000 | timeout to query the health route |

## Cron

One cron automatically reset the counter at 100 000 of demo API key.

## Log format

```
:ip ":user" [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
```

## Open API

[open-api documentation](https://unpaywall.inist.fr/open-api?doc=apikey)

## Test

```
# Functional tests
npm run test
# Unit test
# it's your turn to play
```