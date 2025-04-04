#!/bin/bash

# api ezunpaywall
SCRIPT_DIR=$(dirname "${BASH_SOURCE[0]}")
LOCAL_ENV_FILE="$SCRIPT_DIR/ezunpaywall.local.env.sh"

export REDIS_PASSWORD='changeme'
export NODE_CONFIG='{ "smtp": { "secure": false, "ignoreTLS": true } }'

# disabled it if you are in deployment

if [[ -f $LOCAL_ENV_FILE ]] ; then
  source "$LOCAL_ENV_FILE"
fi
