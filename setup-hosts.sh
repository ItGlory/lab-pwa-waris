#!/bin/bash

# Add WARIS domains to /etc/hosts
echo ""
echo "# WARIS Local Development" | sudo tee -a /etc/hosts
echo "127.0.0.1 waris.local" | sudo tee -a /etc/hosts
echo "127.0.0.1 api.waris.local" | sudo tee -a /etc/hosts
echo "127.0.0.1 ai.waris.local" | sudo tee -a /etc/hosts
echo "127.0.0.1 traefik.waris.local" | sudo tee -a /etc/hosts
echo "127.0.0.1 pgadmin.waris.local" | sudo tee -a /etc/hosts
echo "127.0.0.1 mongo.waris.local" | sudo tee -a /etc/hosts
echo "127.0.0.1 redis.waris.local" | sudo tee -a /etc/hosts
echo "127.0.0.1 minio.waris.local" | sudo tee -a /etc/hosts
echo "127.0.0.1 s3.waris.local" | sudo tee -a /etc/hosts
echo "127.0.0.1 mlflow.waris.local" | sudo tee -a /etc/hosts
echo "127.0.0.1 llm.waris.local" | sudo tee -a /etc/hosts
echo "127.0.0.1 milvus.waris.local" | sudo tee -a /etc/hosts

echo ""
echo "✓ Hosts entries added successfully!"
