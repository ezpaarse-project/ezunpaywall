#!/bin/bash

set -uo pipefail

ELASTIC_NODE="${ELASTIC_NODE:-http://localhost:9200}"
ELASTIC_ADMIN_USER="${ELASTIC_ADMIN_USER:-elastic}"
ELASTIC_ADMIN_PASSWORD="${ELASTIC_ADMIN_PASSWORD:-}"
ELASTIC_API_KEY_NAME="${ELASTIC_API_KEY_NAME:-ezunpaywall-graphql-app-key}"

if [[ -z "$ELASTIC_ADMIN_PASSWORD" ]]; then
  echo "ELASTIC_ADMIN_PASSWORD required." >&2
  exit 1
fi

BODY=$(cat <<EOF
{
  "name": "${ELASTIC_API_KEY_NAME}",
  "role_descriptors": {
    "holdings_rw": {
      "cluster": ["monitor"],
      "index": [
        {
          "names": ["holdings*"],
          "privileges": [
            "monitor",
            "create_index",
            "delete_index",
            "view_index_metadata",
            "maintenance",
            "index",
            "delete",
            "read"
          ]
        }
      ]
    }
  }
}
EOF
)

echo "Connecting to ${ELASTIC_NODE} as ${ELASTIC_ADMIN_USER}"

RESPONSE=$(curl --silent --insecure --write-out "\n%{http_code}" \
  --request POST "${ELASTIC_NODE}/_security/api_key" \
  --user "${ELASTIC_ADMIN_USER}:${ELASTIC_ADMIN_PASSWORD}" \
  --header "Content-Type: application/json" \
  --data "${BODY}") || {
  echo "Cannot create API key in Elasticsearch." >&2
  exit 1
}

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
DATA=$(echo "$RESPONSE" | head -n-1)

if [[ "$HTTP_CODE" != "200" ]]; then
  echo "Error creating API key in Elasticsearch (HTTP ${HTTP_CODE}) :" >&2
  echo "$DATA" >&2
  exit 1
fi

ID=$(echo "$DATA"       | grep -o '"id":"[^"]*"'          | cut -d'"' -f4)
API_KEY=$(echo "$DATA"  | grep -o '"api_key":"[^"]*"'     | cut -d'"' -f4)
NAME=$(echo "$DATA"     | grep -o '"name":"[^"]*"'        | cut -d'"' -f4)

ENCODED=$(printf '%s' "${ID}:${API_KEY}" | base64 | tr -d '\n')

echo "API key created"
echo "name: ${NAME}"
echo "ID: ${ID}"

echo "API key: ${ENCODED}"