#!/bin/bash
# Fix Traefik Docker Provider on macOS Docker Desktop

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "🔧 Fixing Traefik Docker Provider for macOS..."
echo "Working directory: $SCRIPT_DIR"

# Stop Traefik
echo "Stopping Traefik..."
docker compose -f docker-compose.traefik.yml stop traefik

# Create a new docker-compose override for macOS
cat > docker-compose.override.yml << 'EOF'
version: "3.9"

services:
  traefik:
    volumes:
      # Use the actual Docker Desktop socket path
      - /Users/${USER}/.docker/run/docker.sock:/var/run/docker.sock:ro
    environment:
      # Set Docker host explicitly
      - DOCKER_HOST=unix:///var/run/docker.sock
      - DOCKER_API_VERSION=1.44
EOF

echo "Created docker-compose.override.yml"

# Restart Traefik
echo "Restarting Traefik..."
docker compose -f docker-compose.traefik.yml up -d traefik

echo ""
echo "✅ Done!"
echo ""
echo "Wait 10 seconds and check:"
echo "  http://localhost:8888"
echo ""
echo "If you see services in Traefik dashboard, then:"
echo "  1. Add to /etc/hosts:"
echo "     sudo sh -c 'echo \"127.0.0.1 waris.local api.waris.local\" >> /etc/hosts'"
echo ""
echo "  2. Access via:"
echo "     https://waris.local:8443"
echo "     https://api.waris.local:8443"
echo ""
