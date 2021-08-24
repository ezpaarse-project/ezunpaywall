#!/bin/bash

# api ezunpaywall
SCRIPT_DIR=$(dirname "${BASH_SOURCE[0]}")
LOCAL_ENV_FILE="$SCRIPT_DIR/ezunpaywall.local.env.sh"

# unpaywall
export API_KEY_UPW="X-API-KEY"

# clé api pour autoriser les utilisateurs à requêter sur ezunpaywall
export API_KEY_USERS="[\"user\"]"

export API_KEY_ADMIN="[\"admin\"]"

# mail
export SMTP_PORT=25
export NOTIFICATIONS_SENDER='ezunpaywall <ezunpaywall@inist.fr>'
export NOTIFICATIONS_RECEIVERS='you@you.org'

# disabled it if you are in deploiement

if [[ -f $LOCAL_ENV_FILE ]] ; then
  source "$LOCAL_ENV_FILE"
fi
