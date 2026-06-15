# ezunpaywall-admin

Admin service to manage API keys to access to graphql and enrich service.
This service is for administrators.

## Config

To set up this service, you can use environment variables. The config is displayed at startup. Sensitive data are not displayed.

- see [default config](./config/default.json)
- see [env variables](./config/custom-environment-variables.js)

## Command to set volume permissions (non root image docker)

```sh
docker compose run --rm --entrypoint "" --user root admin chown -R node /usr/src/app/log
docker compose run --rm --entrypoint "" --user root admin chown -R node /usr/src/app/data
```

## Cron

- Demo apikey : Reset the counter at 100 000 of demo API key.
- Clean File : Deletes data or log files after a certain period of time.

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
```

### Mirror quality

To check if unpaywall.inist.fr is equal to unpaywall API. you can use this test :

```sh
export ELASTIC_NODES="<elastic node of ezunpaywall>"
export ELASTIC_PASSWORD="<elastic password of ezunpaywall>"
export TEST_MIRROR_SIZE="<size of id tested>"

npm run test:mirror
```

Warning: Unpaywall is slow to respond.

At the end of the test, this should log something like that : 
```
OA: 100/100
Pure same: 75/100
```