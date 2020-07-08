# ez-unpaywall #

ez-unpaywall is an API and database that queries the UnPayWall database containing free scholarly articles

**Table of content**
- [Recommended system requirements](#recommended-system-requirements)
- [Prerequisites](#prerequisites)
- [Installation quickstart](#installation-quickstart)
- [Test the installation](#test-the-installation)

## Recommended system requirements ##

- a linux box or VM (eg: Ubuntu)
- ??Gb disk space (depends on the size of the database)

## Prerequisites ##

The tools you need to let ez-unpaywall run are :
* docker
* docker-compose

## Installation quickstart ##

If you are a Linux user
- modify the environment variables present in the /config/env.sh file, they allow to use the identifiers of the database as well as the ports to use
- now you can execute ```docker-compose up``` where is the docker-compose file

## Test the installation ##

After installation, you can test if the API is working properly. for that, execute ```docker-compose -f docker-compose.test.yml``` and see if the tests went well without error

## Test route ##

GET "/graphql?query={getDatasUPW(dois:<dois...>){<fields...>}}"
return an array


| Name | Type | Description |
| --- | --- | --- |
| dois | Array of String | Array of comma separeted doi  |
| fields | String | Array of attributes of UnPayWall object |

### example ###

## GET ##

GET "/graphql?query={getDatasUPW(dois:["10.1038/2211089b0","10.1038/nature12373"]){doi, is_oa, best_oa_location{ url }}}"

## POST ##

POST "/graphql"

Body :

```json
{
    "query": "{getDatasUPW(dois:[\"10.1038/2211089b0\",\"10.1038/nature12373\"]){doi, is_oa, best_oa_location{ url }}}"
}
```

or 


POST "/graphql"

```json
{
    "query": "query ($dois: [ID!]!){ getDatasUPW(dois: $dois){is_oa} }",
    "variables": { 
        "dois" : ["10.1038/2211089b0","10.1038/nature12373"]
    }
}
```

Response: 
Status : 200

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


### Object structure ###

#### UnPayWall object ####

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
| oa_status | String | The OA status, or color, of this resource. |
| published_date | String/Null | The date this resource was published. |
| publisher | String | The name of this resource's publisher. |
| title | String | The title of this resource. |
| updated | String | Time when the data for this resource was last updated. |
| year | Integer/Null | The year this resource was published. |
| z_authors | List of Crossref | List of Crossref |

#### oa_location & best_oa_location object ####

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

#### z_author ####
| Name | Type | Description |
| --- | --- | --- |
| family | String | |
| given | String | |
| ORCID | String | URL-form of an ORCID identifier |
| authenticated-orcid | Boolean | If true, record owner asserts that the ORCID user completed ORCID OAuth authentication |
| affiliation | Array of Affiliation |  |

