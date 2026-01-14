#!/bin/bash

echo "🚀 Starting WARIS with Traefik..."
echo ""

cd /Users/fero/Desktop/Works/HX/PWA/lab-pwa-waris/platform/infra/docker

echo "📦 Pulling latest images..."
docker compose -f docker-compose.traefik.yml pull

echo ""
echo "🔄 Starting services..."
docker compose -f docker-compose.traefik.yml up -d

echo ""
echo "⏳ Waiting for services to start (30 seconds)..."
sleep 30

echo ""
echo "📊 Service Status:"
docker compose -f docker-compose.traefik.yml ps

echo ""
echo "✅ WARIS is starting!"
echo ""
echo "🌐 Access your services:"
echo "   Frontend:  https://waris.local:8443"
echo "   API Docs:  https://api.waris.local:8443/docs"
echo "   Dashboard: https://traefik.waris.local:8888"
echo ""
echo "📝 View logs:"
echo "   docker compose -f docker-compose.traefik.yml logs -f"
echo ""
echo "Note: Services may take 2-3 minutes to be fully ready."
echo "      First request might be slow as containers initialize."
