#!/bin/bash

# api ezunpaywall
SCRIPT_DIR=$(dirname "${BASH_SOURCE[0]}")
LOCAL_ENV_FILE="$SCRIPT_DIR/ezunpaywall.local.env.sh"

# unpaywall
export API_KEY_UPW="changeme"

# redis
export REDIS_PASSWORD="changeme"

# mail
export SMTP_PORT=25
export NODE_CONFIG='{ "smtp": { "secure": false, "ignoreTLS": true } }'

export NOTIFICATIONS_SENDER='ezunpaywall <ezunpaywall@inist.fr>'
export NOTIFICATIONS_RECEIVERS='you@you.org'

# disabled it if you are in deploiement

if [[ -f $LOCAL_ENV_FILE ]] ; then
  source "$LOCAL_ENV_FILE"
fi
