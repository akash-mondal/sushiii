#!/bin/bash

set -e

BUNDLE_ID=${1:-""}

if [ -z "$BUNDLE_ID" ]; then
  echo "Usage: ./scripts/verify-proof.sh <bundle-id>"
  exit 1
fi

API_URL=${API_URL:-"http://localhost:3001"}
API_KEY=${API_KEY:-"test-key"}
METAGRAPH_L0=${METAGRAPH_L0:-"http://localhost:9200"}

echo "Fetching proof bundle: $BUNDLE_ID"
echo ""

BUNDLE=$(curl -s "$API_URL/api/proof-bundles/$BUNDLE_ID" \
  -H "X-API-Key: $API_KEY")

echo "Bundle retrieved:"
echo "$BUNDLE" | jq '.'

echo ""
echo "Verifying snapshots..."

SNAPSHOT_ORDINAL=$(echo "$BUNDLE" | jq -r '.data.snapshot_refs[0].ordinal')
SNAPSHOT_HASH=$(echo "$BUNDLE" | jq -r '.data.snapshot_refs[0].hash')

ACTUAL_SNAPSHOT=$(curl -s "$METAGRAPH_L0/snapshots/$SNAPSHOT_ORDINAL")
ACTUAL_HASH=$(echo "$ACTUAL_SNAPSHOT" | jq -r '.hash')

if [ "$SNAPSHOT_HASH" == "$ACTUAL_HASH" ]; then
  echo "✓ Snapshot verification passed"
else
  echo "✗ Snapshot verification failed"
  echo "  Expected: $SNAPSHOT_HASH"
  echo "  Actual:   $ACTUAL_HASH"
fi

echo ""
echo "Verification complete!"
