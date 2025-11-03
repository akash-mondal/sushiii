#!/bin/bash

set -e

API_URL=${API_URL:-"http://localhost:3001"}
API_KEY=${API_KEY:-"test-key"}

echo "Seeding sample policies to $API_URL..."

curl -X POST "$API_URL/api/policies" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "policy_id": "privacy-policy",
    "version": "1.0.0",
    "content_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "uri": "https://example.com/privacy/v1",
    "jurisdiction": "US",
    "effective_from": "2024-01-01T00:00:00Z"
  }'

echo ""
echo ""

curl -X POST "$API_URL/api/policies" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "policy_id": "terms-of-service",
    "version": "1.0.0",
    "content_hash": "d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35",
    "uri": "https://example.com/terms/v1",
    "jurisdiction": "US",
    "effective_from": "2024-01-01T00:00:00Z"
  }'

echo ""
echo ""
echo "Sample policies created successfully!"
