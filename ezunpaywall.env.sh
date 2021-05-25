#!/bin/bash

SCRIPT_DIR=$(dirname "${BASH_SOURCE[0]}")
LOCAL_ENV_FILE="$SCRIPT_DIR/ezunpaywall.local.env.sh"

# unpaywall
export API_KEY_UPW="api_key"
export UNPAYWALL_URL="http://api.unpaywall.org/feed/changefiles"

# mail
export EZUNPAYWALL_SMTP_PORT=25
export EZUNPAYWALL_NOTIFICATIONS_SENDER='ez-unpaywall <ez-unpaywall@inist.fr>'
export EZUNPAYWALL_NOTIFICATIONS_RECEIVERS='you@you.org'

# disabled it if you are in deploiement
export NODE_CONFIG='{ "smtp": { "secure": false, "ignoreTLS": true } }'

EZUNPAYWALL_NODE_NAME=`hostname`
THIS_HOST=`hostname -I | cut -d ' ' -f1`

# kibana env settings
export EZUNPAYWALL_AUTH_SECRET="d7a8c699c63836b837af086cfb3441cbcfcf1a02"
export EZUNPAYWALL_SMTP_HOST="127.0.0.1"
export ELASTICSEARCH_USERNAME="elastic"
export ELASTICSEARCH_PASSWORD="changeme"
export ELASTICSEARCH_HOSTS="http://elastic:9200"
export SERVER_HOST="0.0.0.0"
export SERVER_PORT="5601"
export KIBANA_DEFAULTAPPID="dashboard/homepage"

# default values for elastic.yml or kibana.yml configuration
export EZUNPAYWALL_ES_DISCOVERY=""
export EZUNPAYWALL_ES_DISCOVERY_TYPE="single-node"
export EZUNPAYWALL_ES_NODE_NAME="${EZUNPAYWALL_NODE_NAME}"
export EZUNPAYWALL_ES_PUBLISH="${THIS_HOST}"
export EZUNPAYWALL_ES_INITIAL_MASTER_NODES=""

# these values are overwriten by ezunpaywall.env.local.sh values
export NODE_ENV="dev"
export EZUNPAYWALL_ES_NODE_MASTER="true"
export EZUNPAYWALL_ES_NODE_DATA="true"
export EZUNPAYWALL_ES_NODE_INGEST="true"
export EZUNPAYWALL_ES_NODE_SEARCH_REMOTE="true"
export ES_JAVA_OPTS="-Xms2g -Xmx2g"
export EZUNPAYWALL_ES_MEM_LIMIT="4g"

if [[ -f ezunpaywall.local.env.sh ]] ; then
  source ezunpaywall.local.env.sh
fi

# set local EZUNPAYWALL_ES_DISCOVERY variable
# should contain all ES cluster IP host except local IP address
# needs EZUNPAYWALL_NODES in environment

if [[ ! -z ${EZUNPAYWALL_NODES} ]] ; then
  for node in ${EZUNPAYWALL_NODES} ; do
    if [[ ! $node = $THIS_HOST ]] ; then
      EZUNPAYWALL_ES_DISCOVERY="${EZUNPAYWALL_ES_DISCOVERY},${node}:9300"
    fi
  done
fi

if [[ ! -z ${EZUNPAYWALL_ES_DISCOVERY} ]] ; then
  EZUNPAYWALL_ES_DISCOVERY_TYPE="zen"
fi
