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
* nvm
* docker
* docker-compose

## Installation quickstart ##

If you are a Linux user
- execute ```npm i``` at the root of the project
- modify the environment variables present in the /config/env.sh file, they allow to use the identifiers of the database as well as the ports to use
- now you can execute ```docker-compose up``` where is the docker-compose file

## Test the installation ##

After installation, you can test if the API is working properly. for that, execute ```docker-compose -f docker-compose.test.yml``` and see if the tests went well without error