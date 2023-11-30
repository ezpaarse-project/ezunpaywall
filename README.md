# ezunpaywall

Ezunpaywall is an API and database that queries the Unpaywall database containing free scholarly articles.

**Table of content**
- [Structure](#Structure)
- [Installation](#Installation)
    - [Development](#Development)
        - [Prerequisites](#Prerequisites)
        - [Start](#Start)
        - [Tests](#Tests)
    - [Deployment](#Deployment)
        - [Prerequisites](#Prerequisites)
        - [Environment variables](#Environment-variables)
            - [apikey](/src/apikey/README.md#ezunpaywall-apikey)
            - [enrich](/src/enrich/README.md#ezunpaywall-enrich)
            - [frontend](/src/frontend/README.md#ezunpaywall-frontend)
            - [graphql](/src/graphql/README.md#ezunpaywall-graphql)
            - [health](/src/health/README.md#ezunpaywall-health)
            - [mail](/src/mail/README.md#ezunpaywall-mail)
            - [update](/src/update/README.md#ezunpaywall-update)
- [Data update](#Data-update)
- [API Graphql](#API-graphql)

## Structure

Unpaywall is made up of several services which are distributed in several docker containers.
![Structure](/doc/structure.png)

for `apikey`, `enrich`, `graphql`, `health`, `mail` and `update` service, a **open api** is available on frontend

## Installation

```bash
git clone https://github.com/ezpaarse-project/ezunpaywall 
```
### Development

#### Prerequisites

The tools you need to let ezunpaywall run are :
* docker
* npm

Command : 

```bash
# install dependencies
npm i

# create volume for elastic
docker-compose -f docker-compose.debug.yml run --rm elastic chown -R elasticsearch /usr/share/elasticsearch/ 
```
#### Start

```bash
# Start ezunpaywall as daemon
docker-compose -f docker-compose.debug.yml up -d

# Stop ezunpaywall
docker-compose -f docker-compose.debug.yml stop

# Get the status of ezunpaywall services
docker-compose -f docker-compose.debug.yml ps
```
#### Tests

To run tests, you need ezunpaywall to be launched in dev mode with fakeUnpaywall. With that, you can run test on.

```bash
# there are alias on root folder
$ ~/ezunpaywall npm run test
$ ~/ezunpaywall npm run test:apikey
$ ~/ezunpaywall npm run test:enrich
$ ~/ezunpaywall npm run test:graphql
$ ~/ezunpaywall npm run test:update

# you can run test for each service
$ ~/ezunpaywall/src/apikey npm run test
$ ~/ezunpaywall/src/enrich npm run test
$ ~/ezunpaywall/src/graphql npm run test
$ ~/ezunpaywall/src/update npm run test
```
### Deployment

#### Prerequisites

The tools you need to let ezunpaywall run are :
* docker
* unpaywall data measured about 130Gb it is necessary to provide the necessary place on the hard drive

#### Environment variables

Create an environment file named `ezunpaywall.local.env.sh` and export the following environment variables. You can then source `ezunpaywall.env.sh`, which contains a set of predefined variables and is overriden by `ezunpaywall.local.env.sh`.

Details : 
* [apikey](/src/apikey#ezunpaywall-apikey)
* [enrich](/src/enrich#ezunpaywall-enrich)
* [fakeUnpaywall](/src/fakeUnpaywall#ezunpaywall-fakeUnpaywall)
* [frontend](/src/frontend#ezunpaywall-frontend)
* [graphql](/src/graphql#ezunpaywall-graphql)
* [health](/src/health#ezunpaywall-health)
* [mail](/src/mail#ezunpaywall-mail)
* [nginx](/src/nginx#ezunpaywall-nginx)
* [update](/src/update#ezunpaywall-update)

### Adjust system configuration for Elasticsearch

Elasticsearch has some [system requirements](https://www.elastic.co/guide/en/elasticsearch/reference/current/system-config.html) that you should check.

To avoid memory exceptions, you may have to increase mmaps count. Edit `/etc/sysctl.conf` and add the following line :

```ini
# configuration needed for elastic search
vm.max_map_count=262144
```
Then apply the changes : 
```bash
sysctl -p
```
### Start/Stop/Status

Before you start ezunpaywall, make sure all necessary environment variables are set.

```bash
# Start ezunpaywall as daemon
docker-compose up -d

# Stop ezunpaywall
docker-compose stop

# Get the status of ezunpaywall services
docker-compose ps
```
## Data update 

You can update your data via update snapshots provided by unpaywall on a weekly or daily basis (if you have API key).
in the update service, there is a cron that allows to automatically update the data from unpaywall, weekly or daily.

## API Graphql
### unpaywall

get unpaywall data with [parameters](#Object-structure). 
### Examples
#### GET

```js
headers: {
    "x-api-key": "<YOUR_API_KEY>"
}
```

`GET "<HOST>/api/graphql?query={unpaywall(dois:["10.1038/2211089b0","10.1038/nature12373"]){doi, is_oa, best_oa_location{ url }}}"`

#### POST

`POST "<HOST>/api/graphql"`

```js
headers: {
    "x-api-key": "<YOUR_API_KEY>"
},
body: {
    "query": "{unpaywall(dois:[\"10.1038/2211089b0\",\"10.1038/nature12373\"]){doi, is_oa, best_oa_location{ url }}}"
}
```

`POST "<HOST>/api/graphql"`

```js
headers: {
    "x-api-key": "<YOUR_API_KEY>"
},
body: {
    "query": "query ($dois: [ID!]!){ unpaywall(dois: $dois){is_oa} }",
    "variables": { 
        "dois": ["10.1038/2211089b0","10.1038/nature12373"],
    }
}
```

Response 
Status: 200

```json
{
    "data": {
        "unpaywall": [
            {
                "doi": "10.1038/2211089b0",
                "is_oa": true,
                "best_oa_location": {
                    "url": "http://www.nature.com/articles/2211089b0.pdf"
                }
            }
        ]
    }
}
```
### Object structure

[data-format](https://unpaywall.org/data-format)