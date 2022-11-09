# ezunpaywall

ezunpaywall is an API and database that queries the Unpaywall database containing free scholarly articles

**Table of content**
- [Structure](#Structure)
- [Installation](#Installation)
    - [Developement](#Development)
        - [Prerequisites](#Prerequisites)
        - [Start](#Start)
        - [Tests](#Tests)
    - [Deployment](#Deployment)
        - [Prerequisites](#Prerequisites)
        - [Environment variables](#Environment-variables)
            - [apikey](#apikey)
            - [enrich](#enrich)
            - [frontend](#frontend)
            - [graphql](#graphql)
            - [mail](#mail)
            - [update](#update)
- [Data update](#Data-update)
- [API Graphql](#API-graphql)

## Structure

unpaywall is made up of several services which are distributed in several docker containers
![Structure](/doc/structure.png)

for apikey, enrich, update and mail service, a **open api** is available on frontend

## Installation

```bash
git clone https://github.com/ezpaarse-project/ezunpaywall 
```
### Development

#### Prerequisites

The tools you need to let ezunpaywall run are :
* docker
* docker-compose
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

To run tests, you need ezunpaywall to be launched in dev mode with fakeUnpaywall. With that, you can run test on 

```bash
# there are alias on root folder
$ ezunpaywall npm run test
$ ezunpaywall npm run test:apikey
$ ezunpaywall npm run test:enrich
$ ezunpaywall npm run test:graphql
$ ezunpaywall npm run test:mail
$ ezunpaywall npm run test:update

# you can run test for each service
$ ezunpaywall/src/apikey npm run test
$ ezunpaywall/src/enrich npm run test
$ ezunpaywall/src/graphql npm run test
$ ezunpaywall/src/mail npm run test
$ ezunpaywall/src/update npm run test

```

### Deployment

#### Prerequisites

The tools you need to let ezunpaywall run are :
* docker
* docker-compose
* unpaywall data measured about 130Gb it is necessary to provide the necessary place on the hard drive

#### Environment variables

Create an environment file named `ezunpaywall.local.env.sh` and export the following environment variables. You can then source `ezunpaywall.env.sh`, which contains a set of predefined variables and is overriden by `ezunpaywall.local.env.sh`.
##### apikey

| name | default | description |
| --- | --- | --- |
| NODE_ENV | development | environment of node |
| REDIS_HOST | redis | redis host |
| REDIS_PORT | 6379 | redis port |
| REDIS_PASSWORD | changeme | redis password |
| APIKEY_APPLICATION_LOG_PATH | ./src/apikey/log/application | application output log path |
| APIKEY_ACCESS_LOG_PATH | ./src/apikey/log/access | access log output path |
| APIKEY_PORT | 59704 | output port |
##### enrich

| name | default | description |
| --- | --- | --- |
| NODE_ENV | development | environment of node |
| REDIS_HOST | redis | redis host |
| REDIS_PORT | 6379 | redis port |
| REDIS_PASSWORD | changeme | redis password |
| ENRICH_APPLICATION_LOG_PATH | ./src/enrich/log/application | application output log path |
| ENRICH_ACCESS_LOG_PATH | ./src/enrich/log/access | access log output path |
| ENRICH_DATA_PATH | ./src/enrich/data | access data output path |
| ENRICH_PORT | 59703 | output port |

##### frontend

| name | default | description |
| --- | --- | --- |
| NODE_ENV | development | enviroement of node |
| GRAPHQL_HOST | http://localhost:59701 | graphql host |
| UPDATE_HOST | http://localhost:59702 | update host |
| ENRICH_HOST | http://localhost:59703 | enrich host |
| APIKEY_HOST | http://localhost:59704 | apikey host |
| MAIL_HOST | http://localhost:59705 | mail host |
| MAIL_APIKEY | changeme | mail apikey |
| ELASTICSEARCH_ORIGIN | development | environment of elastic |
| FRONTEND_PORT | 59706 | output port |

##### graphql

| name | default | description |
| --- | --- | --- |
| NODE_ENV | development | environnement of node |
| REDIS_HOST | redis | redis host |
| REDIS_PORT | 6379 | redis port |
| REDIS_PASSWORD | changeme | redis password |
| ELASTICSEARCH_HOSTS | http://elastic | elastic host |
| ELASTICSEARCH_PORT | 9200 | elastic port |
| ELASTICSEARCH_USERNAME | elastic | username of elastic super user |
| ELASTICSEARCH_PASSWORD | changeme | password of elastic super user |
| ELASTICSEARCH_INDEX_ALIAS | upw | default alias of unpaywall data |
| GRAPHQL_APPLICATION_LOG_PATH | ./src/graphql/log/application | application output log path |
| GRAPHQL_ACCESS_LOG_PATH | ./src/graphql/log/access | access log output path |
| ELASTIC_CERT_CA_PATH | ./src/graphql/certs/ca.crt | elastic ca certificate path |
| GRAPHQL_APPLICATION_LOG_PATH | ./src/graphql/log/application | application output log path |
| GRAPHQL_ACCESS_LOG_PATH | ./src/graphql/log/access | access log output path |
| GRAPHQL_PORT | 59701 | output port |

##### mail

| name | default | description |
| --- | --- | --- |
| NODE_ENV | development | environment of node |
| NODE_CONFIG | {} | make tls and secure of mail (only in developement) |
| MAIL_SMTP_HOST | localhost | SMTP server host |
| MAIL_SMTP_PORT | 25 | SMTP server port |
| MAIL_NOTIFICATIONS_SENDER | ezunpaywall | the sender for emails issued by ezunpaywall |
| MAIL_NOTIFICATIONS_RECEIVERS | ["ezunpaywall@example.fr"] | recipients of the recent activity email |
| MAIL_NOTIFICATIONS_MACHINE | dev | environment of machine |
| MAIL_APIKEY | changeme | mail apikey |
| MAIL_APPLICATION_LOG_PATH | ./src/mail/log/application | application output log path |
| MAIL_ACCESS_LOG_PATH | ./src/mail/log/access | access log output path |
| MAIL_PORT | 59705 | output port |

##### update

| name | default | description |
| --- | --- | --- |
| NODE_ENV | development | environnement of node |
| UNPAYWALL_HOST | http://fakeunpaywall:3000 | unpaywall api host to access to changefiles |
| UNPAYWALL_APIKEY | changeme | unpaywall apikey to access to changefiles |
| REDIS_HOST | redis | redis host |
| REDIS_PORT | 6379 | redis port |
| REDIS_PASSWORD | changeme | redis password |
| ELASTICSEARCH_HOSTS | http://elastic | elastic host |
| ELASTICSEARCH_PORT | 9200 | elastic port |
| ELASTICSEARCH_USERNAME | elastic | username of elastic super user |
| ELASTICSEARCH_PASSWORD | changeme | password of elastic super user |
| ELASTICSEARCH_MAX_BULK_SIZE | 4000 | max bulk size of update process |
| ELASTICSEARCH_INDEX_ALIAS | upw | default alias of unpaywall data |
| ELASTICSEARCH_CERTS_PATH | '' | elastic certificate path |
| MAIL_HOST | http://mail:3000 | mail service host |
| MAIL_APIKEY | changeme | mail apikey |
| UPDATE_APPLICATION_LOG_PATH | ./src/update/log/application | application output log path |
| UPDATE_ACCESS_LOG_PATH | ./src/update/log/access | access log output path |
| UPDATE_DATA_PATH | ./src/update/data | access data output path |
| UPDATE_PORT | 59702 | output port |

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

### Data update API

`POST "/update/:name`

| Name | Type | Description |
| --- | --- | --- |
| name | PARAMS | name of file that the server has already downloaded |
| offset | QUERY (optionnal) | first line insertion, by default, we start with the first |
| limit | QUERY (optionnal)| last line insertion by default, we have no limit |

Insert the content of files that the server has already downloaded (file in .gz format). offset and limit are the variables to designate from which line to insert and from which line to stop.

`POST "/update`

| Name | Type | Description |
| --- | --- | --- |
| startDate | QUERY (optionnal) | period start date at format YYYY-mm-dd |
| endDate | QUERY (optionnal) | period end date at format YYYY-mm-dd |

Downloads update files offered by unpaywall.
- If there are no `start` and` end` attributes, It will execute
the download and the insertion of the most recent update file.
- If there are the `start` and` end` attributes, It will execute the download and the insertion of the update files between the given period.
- If there is the `start` attribute, It will execute the download and
the insertion of the update files between the` start` date and the current date.
## API Graphql
### GetByDOI

get Unpaywall data with [parameters](#Object-structure). 
You can also use intervals 
### Examples
#### GET

```js
headers: {
    "x-api-key": "<YOUR_API_KEY>"
}
```

`GET "<HOST>/api/graphql?query={GetByDOI(dois:["10.1038/2211089b0","10.1038/nature12373"], published_date_range: {gte: "2014", lte: "2019"}){doi, is_oa, best_oa_location{ url }}}"`

#### POST

`POST "<HOST>/api/graphql"`

```js
headers: {
    "x-api-key": "<YOUR_API_KEY>"
},
body: {
    "query": "{GetByDOI(dois:[\"10.1038/2211089b0\",\"10.1038/nature12373\"], published_date_range: {gte: \"2014\", lte: \"2019\"}){doi, is_oa, best_oa_location{ url }}}"
}
```

`POST "<HOST>/api/graphql"`

```js
headers: {
    "x-api-key": "<YOUR_API_KEY>"
},
body: {
    "query": "query ($dois: [ID!]!){ GetByDOI(dois: $dois, published_date_range: $published_date_range){is_oa} }",
    "variables": { 
        "dois": ["10.1038/2211089b0","10.1038/nature12373"],
        "published_date_range": {
          "lte": "2014",
          "gte": "2019",
        } 
    }
}
```

Response 
Status: 200

```json
{
    "data": {
        "GetByDOI": [
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
#### UnPayWall object

| Name | Type | Description |
| --- | --- | --- |
| doi | String | The DOI of this resource. |
| best_oa_location | Object | The best OA Location Object we could find for this DOI. |
| data_standard | Integer | Indicates the data collection approaches used for this resource. |
| doi_url | String | The DOI in hyperlink form. |
| genre | String | The type of resource. |
| is_paratext | Boolean | Is the item an ancillary part of a journal, like a table of contents? |
| is_oa | Boolean | Is there an OA copy of this resource. |
| journal_is_in_doaj | Boolean | Is this resource published in a DOAJ-indexed journal. |
| journal_is_oa | Boolean | Is this resource published in a completely OA journal. |
| journal_issns | String | Any ISSNs assigned to the journal publishing this resource. |
| journal_issn_l | String | A single ISSN for the journal publishing this resource. |
| journal_name | String | The name of the journal publishing this resource. |
| oa_locations | List | List of all the OA Location objects associated with this resource. |
| first_oa_location | Object | The first OA Location Object we could find for this DOI. |
| oa_status | String | The OA status, or color, of this resource. |
| published_date | String/Null | The date this resource was published. |
| publisher | String | The name of this resource's publisher. |
| title | String | The title of this resource. |
| updated | String | Time when the data for this resource was last updated. |
| year | Integer/Null | The year this resource was published. |
| z_authors | List of Crossref | List of Crossref |

#### oa_location, best_oa_location object first_oa_location object

| Name | Type | Description |
| --- | --- | --- |
| evidence | String | How we found this OA location. |
| host_type | String | The type of host that serves this OA location. |
| is_best | Boolean | Is this location the best_oa_location for its resource.	 |
| license | String/Null | The license under which this copy is published. |
| pmh_id | String/Null | OAI-PMH endpoint where we found this location. |
| updated | String | Time when the data for this location was last updated. |
| url | String | The url_for_pdf if there is one; otherwise landing page URL. |
| url_for_landing_page | String | The URL for a landing page describing this OA copy. |
| url_for_pdf | String/Null | The URL with a PDF version of this OA copy. |
| version | String | The content version accessible at this location. |

#### z_author
| Name | Type | Description |
| --- | --- | --- |
| family | String | |
| given | String | |
| ORCID | String | URL-form of an ORCID identifier |
| authenticated-orcid | Boolean | If true, record owner asserts that the ORCID user completed ORCID OAuth authentication |
| affiliation | Array of Affiliation |  |

[data-format](https://unpaywall.org/data-format)