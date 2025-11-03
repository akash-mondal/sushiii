#!/bin/bash

set -e

NETWORK=${1:-"integration"}

if [ "$NETWORK" != "integration" ] && [ "$NETWORK" != "mainnet" ]; then
  echo "Error: Invalid network. Use 'integration' or 'mainnet'"
  exit 1
fi

echo "Deploying Sushiii metagraph to $NETWORK..."

if [ "$NETWORK" == "mainnet" ]; then
  echo ""
  echo "WARNING: You are about to deploy to MainNet!"
  echo "Have you tested on IntegrationNet for at least 24 hours? (y/n)"
  read -r response
  if [ "$response" != "y" ]; then
    echo "Deployment cancelled"
    exit 0
  fi
fi

echo ""
echo "Building metagraph JARs..."
cd metagraph
sbt assembly

echo ""
echo "JAR files built:"
ls -lh */target/scala-2.13/*.jar

echo ""
echo "Deployment steps:"
echo "1. Upload JARs to your deployment server"
echo "2. Configure environment variables on server"
echo "3. Start Metagraph L0 nodes"
echo "4. Start Data L1 nodes"
echo "5. Verify cluster health: curl http://[L0-URL]/cluster/info"
echo ""
echo "For detailed deployment instructions, see docs/deployment.md"
