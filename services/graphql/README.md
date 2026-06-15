# ezunpaywall-graphql

A graphql API for querying unpaywall data via one or more DOIs.

## Config

To set up this service, you can use environment variables. The config is displayed at startup. Sensitive data are not displayed.

- see [default config](./config/default.json)
- see [env variables](./config/custom-environment-variables.js)

## Command to set volume permissions (non root image docker)

```sh
docker compose run --rm --entrypoint "" --user root graphql chown -R node /usr/src/app/log
```

## Activity diagram

![Activity-diagram](./docs/activity-diagram-graphql.png)

### Object structure

[data-format](https://unpaywall.org/data-format)

## Graphql Request

### API key

You can put your API key in the query or in the header.
- In the query, use the key: `apikey`
- in the header, use the key: `x-api-key`

### Curl

```bash
# GET
curl --request GET \
  --url 'https://unpaywall.inist.fr/api/graphql?query=%7Bunpaywall(dois%3A%5B%2210.1001%2Fjama.2016.9797%22%5D)%7Bdoi%2C%20is_oa%2C%20oa_status%2C%20data_standard%2C%20updated%2C%20best_oa_location%7B%20evidence%20%7D%7D%7D' \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: demo' 

# POST
curl --request POST \
  --url https://unpaywall.inist.fr/api/graphql \
  --header 'Content-Type: application/json' \
  --header 'x-api-key: demo' \
  --data '{"query":"{unpaywall(dois:[\"10.1001/jama.2016.9797\"]){doi,is_oa,oa_status,data_standard,updated,best_oa_location {endpoint_id}}}"}'
```

## Cron

One cron automatically update metrics of unpaywall data. the elastic request takes time and is saved locally.

- Clean File : Deletes log files after a certain period of time.
- metrics : Put in cache the metrics of ezunpaywall data (aggregation of oa_status)

## Log format

```
:date :ip :method :url :statusCode :userAgent :responseTime :countDOI
```

## Open API

[open-api documentation](https://unpaywall.inist.fr/open-api?doc=graphql)

## Test

```
# Functional tests
npm run test

# Unit tests
# TODO
```