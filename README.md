# ez-unpaywall

ez-unpaywall is an API and database that queries the UnPayWall database containing free scholarly articles

**Table of content**
- [Prerequisites](#prerequisites)
- [Installation](#Installation)
- [Configuration](#Configuration)
- [Deploiement](#Deploiement-Start/Stop/Status)
- [Developement](#Development-Start/Stop/Status)
- [Data update](#Data-update)
- [API Graphql](#API-graphql)

## Prerequisites

The tools you need to let ez-unpaywall run are :
* docker
* docker-compose
* a linux box or VM (eg: Ubuntu)
* unpaywall data measured about 130Gb it is necessary to provide the necessary place on the hard drive

## Installation

``` git clone https://github.com/ezpaarse-project/ez-unpaywall```

## Configuration

### Setup Elastic certificates

For each node in the cluster, add certificates in `elasticsearch/config/certificates/`. Kibana should also have certificates in `kibana/config/certificates`. If you don't have them yet, you can generate them by following these steps :

  - Open the `certs` directory.
  - Create an [instances.yml](https://www.elastic.co/guide/en/elasticsearch/reference/current/certutil.html#certutil-silent) file.
  - Run `docker-compose -f create-certs.yml up`.
  - A `certificates` directory should be created, you can just put it in both `elasticsearch/config/` and `kibana/config/`. (**NB**: you may need to `chown` it)


### Setup environment

Create an environment file named `ezunpaywall.env.local.sh` and export the following environment variables. You can then source `ezunpaywall.env.sh` , which contains a set of predefined variables and is overriden by `ezunpaywall.env.local.sh`.

### Adjust system configuration for Elasticsearch

Elasticsearch has some [system requirements](https://www.elastic.co/guide/en/elasticsearch/reference/current/system-config.html) that you should check.

To avoid memory exceptions, you may have to increase mmaps count. Edit `/etc/sysctl.conf` and add the following line :

```ini
# configuration needed for elastic search
vm.max_map_count=262144
```

## Deploiement Start/Stop/Status

Before you start ez-unpaywall, make sure all necessary environment variables are set.

```bash
# Start ez-unpaywall as daemon
docker-compose up -d

# Stop ez-unpaywall
docker-compose stop

# Get the status of ez-unpaywall services
docker-compose ps
```

## Development Start/Stop/Status

It's the same thing but use ```docker-compose.debug.yml```

```bash
# Start ez-unpaywall as daemon
docker-compose -f docker-compose.debug.yml up -d

# Stop ez-unpaywall
docker-compose -f docker-compose.debug.yml stop

# Get the status of ez-unpaywall services
docker-compose -f docker-compose.debug.yml ps
```

## Data update 

You can update your data via update snapshots provided by unpaywall on a weekly basis (if you have API key).
You can directly use the update routes or use the [ezunpaywall command](https://github.com/ezpaarse-project/node-ezunpaywall)

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
| endDate | QUERY (optionnal)| period end date at format YYYY-mm-dd |
Downloads update files offered by unpaywall.
- If there are no `start` and` end` attributes, It will execute
the download and the insertion of the most recent update file.
- If there are the `start` and` end` attributes, It will execute the download and the insertion of the update files between the given period.
- If there is the `start` attribute, It will execute the download and
the insertion of the update files between the` start` date and the current date.

## API Graphql

`GET "/graphql?query={getDatasUPW(dois:<dois...>){<fields...>}}"`
return an array

`POST "/graphql"`
Body: 
```json
{
    "query": "{getDatasUPW(dois:<dois...>){<fields...>}}"
}
```
return an array

| Name | Type | Description |
| --- | --- | --- |
| dois | Array of String | Array of comma separeted doi  |
| fields | String | Array of attributes of UnPayWall object |

## Examples

### GET

`GET "/graphql?query={getDatasUPW(dois:["10.1038/2211089b0","10.1038/nature12373"]){doi, is_oa, best_oa_location{ url }}}"`

### POST

`POST "/graphql"`

Body :

```json
{
    "query": "{getDatasUPW(dois:[\"10.1038/2211089b0\",\"10.1038/nature12373\"]){doi, is_oa, best_oa_location{ url }}}"
}
```

or 


`POST "/graphql"`

```json
{
    "query": "query ($dois: [ID!]!){ getDatasUPW(dois: $dois){is_oa} }",
    "variables": { 
        "dois" : ["10.1038/2211089b0","10.1038/nature12373"]
    }
}
```

Response 
Status: 200

```json
{
    "data": {
        "getDatasUPW": [
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

#### oa_location & best_oa_location object

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

