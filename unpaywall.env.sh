#!/bin/bash

export API_KEY_UPW="api_key"
export EZUNPAYWALL_ELASTIC_USER="elastic"
export EZUNPAYWALL_ELASTIC_PASSWORD="changeme"

if [[ -f unpaywall.local.env.sh ]] ; then
  source unpaywall.local.env.sh
fi