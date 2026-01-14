# WARIS Quick Reference Card

> คำสั่งที่ใช้บ่อย สำหรับ copy-paste

**Print this** หรือ bookmark ไว้!

---

## 🚀 Starting/Stopping Services

```bash
# Start everything
cd platform/infra/docker
docker compose -f docker-compose.traefik.yml up -d

# Stop everything
docker compose -f docker-compose.traefik.yml down

# Restart specific service
docker compose -f docker-compose.traefik.yml restart traefik
docker compose -f docker-compose.traefik.yml restart web
docker compose -f docker-compose.traefik.yml restart api

# Stop and remove volumes (DANGER: deletes data!)
docker compose -f docker-compose.traefik.yml down -v
```

---

## 🔍 Checking Status

```bash
# Quick status
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# With health status
docker ps --format "table {{.Names}}\t{{.Status}}"

# Specific service
docker ps -f name=waris-web

# Check if ports are listening
lsof -i :3000  # Frontend
lsof -i :8000  # API
lsof -i :8443  # Traefik HTTPS
lsof -i :8888  # Traefik Dashboard
```

---

## 📋 Viewing Logs

```bash
# Tail logs (last 50 lines)
docker logs waris-traefik --tail 50
docker logs waris-web --tail 50
docker logs waris-api --tail 50
docker logs waris-postgres --tail 50

# Follow logs (live)
docker logs waris-web -f

# Last 100 lines with timestamps
docker logs waris-api --tail 100 --timestamps

# All logs since 10 minutes ago
docker logs waris-traefik --since 10m
```

---

## 🌐 Testing Access

```bash
# Frontend
curl http://localhost:3000                    # Direct
curl -k https://waris.local:8443              # Via Traefik
open https://waris.local:8443                 # In browser

# Backend API
curl http://localhost:8000                    # Direct
curl http://localhost:8000/health             # Health check
curl -k https://api.waris.local:8443          # Via Traefik
curl http://localhost:8000/docs               # API docs

# Traefik Dashboard
open http://localhost:8888

# Check Traefik routes
curl -s http://localhost:8888/api/http/routers | jq

# Check Traefik services
curl -s http://localhost:8888/api/http/services | jq
```

---

## 🔧 Common Fixes

```bash
# Restart everything
docker compose -f docker-compose.traefik.yml restart

# Clean restart (removes stopped containers)
docker compose -f docker-compose.traefik.yml down
docker compose -f docker-compose.traefik.yml up -d

# Nuclear option (removes volumes)
docker compose -f docker-compose.traefik.yml down -v
docker system prune -f
docker compose -f docker-compose.traefik.yml up -d

# Rebuild specific service
docker compose -f docker-compose.traefik.yml build --no-cache web
docker compose -f docker-compose.traefik.yml up -d web

# Fix permissions
sudo chmod -R 755 platform/apps/web
```

---

## 🗄️ Database Commands

```bash
# PostgreSQL
docker exec -it waris-postgres psql -U waris -d waris

# Common queries
docker exec waris-postgres psql -U waris -c "SELECT version()"
docker exec waris-postgres psql -U waris -c "\l"  # List databases
docker exec waris-postgres psql -U waris -c "\dt"  # List tables

# MongoDB
docker exec -it waris-mongo mongosh -u waris -p <password> waris

# Redis
docker exec -it waris-redis redis-cli
# > PING
# > KEYS *
# > GET somekey

# Backup database
docker exec waris-postgres pg_dump -U waris waris > backup.sql

# Restore database
docker exec -i waris-postgres psql -U waris waris < backup.sql
```

---

## 🔍 Debugging

```bash
# Enter container shell
docker exec -it waris-web sh
docker exec -it waris-api sh

# Run command in container
docker exec waris-web npm run build
docker exec waris-api python -c "import sys; print(sys.version)"

# Check network connectivity
docker exec waris-web ping -c 2 waris-api
docker exec waris-traefik ping -c 2 waris-web

# Test internal services
docker exec waris-traefik wget -qO- http://waris-web:3000
docker exec waris-traefik wget -qO- http://waris-api:8000

# Check environment variables
docker exec waris-web env | grep NEXT_PUBLIC
docker exec waris-api env | grep DATABASE

# Resource usage
docker stats --no-stream
docker stats waris-web --no-stream

# Disk usage
docker system df
docker system df -v
```

---

## 🌐 Network Commands

```bash
# List networks
docker network ls

# Inspect network
docker network inspect waris-network

# Check which containers are in network
docker network inspect waris-network --format '{{json .Containers}}' | jq

# Disconnect/Reconnect container
docker network disconnect waris-network waris-web
docker network connect waris-network waris-web

# Test DNS resolution
docker exec waris-web nslookup waris-api
docker exec waris-web ping waris-api -c 2
```

---

## 📝 File Operations

```bash
# Copy file from container
docker cp waris-web:/app/package.json ./package.json

# Copy file to container
docker cp ./config.json waris-api:/app/config.json

# View file in container
docker exec waris-traefik cat /etc/traefik/traefik.yml

# Edit file in container
docker exec -it waris-web vi /app/.env
```

---

## 🔒 SSL/Certificate

```bash
# Check certificate details
echo | openssl s_client -connect waris.local:8443 2>/dev/null | \
  openssl x509 -noout -text

# Check certificate expiry
echo | openssl s_client -connect waris.local:8443 2>/dev/null | \
  openssl x509 -noout -dates

# Trust certificate (macOS)
sudo security add-trusted-cert -d -r trustRoot \
  -k /Library/Keychains/System.keychain waris.crt

# Generate new self-signed cert
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout waris.key -out waris.crt \
  -subj "/CN=waris.local"
```

---

## 🏗️ Build & Deploy

```bash
# Build all services
docker compose -f docker-compose.traefik.yml build

# Build specific service
docker compose -f docker-compose.traefik.yml build web
docker compose -f docker-compose.traefik.yml build api

# Build without cache
docker compose -f docker-compose.traefik.yml build --no-cache web

# Pull latest images
docker compose -f docker-compose.traefik.yml pull

# Scale service
docker compose -f docker-compose.traefik.yml up -d --scale web=3
```

---

## 🧹 Cleanup

```bash
# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Remove unused volumes
docker volume prune -f

# Remove unused networks
docker network prune -f

# Clean everything (DANGER!)
docker system prune -a -f --volumes

# Remove specific container
docker rm -f waris-web

# Remove specific image
docker rmi docker-web

# Remove specific volume
docker volume rm docker_postgres-data
```

---

## 📊 Monitoring

```bash
# Live resource usage
docker stats

# Specific container
docker stats waris-web

# One-time snapshot
docker stats --no-stream

# Container processes
docker top waris-web

# Container events
docker events --filter container=waris-web

# Inspect container details
docker inspect waris-web
docker inspect waris-web | jq '.[0].State'
docker inspect waris-web | jq '.[0].NetworkSettings'
```

---

## 🔐 Environment & Config

```bash
# Show environment variables
docker exec waris-web env
docker exec waris-api env | grep DATABASE

# Show Docker Compose config
docker compose -f docker-compose.traefik.yml config

# Validate Docker Compose file
docker compose -f docker-compose.traefik.yml config --quiet

# Show running services
docker compose -f docker-compose.traefik.yml ps
```

---

## 📦 Image Management

```bash
# List images
docker images

# List images for this project
docker images | grep waris

# Remove image
docker rmi <image-id>

# Tag image
docker tag docker-web:latest docker-web:v1.0.0

# Save image to file
docker save docker-web:latest | gzip > docker-web.tar.gz

# Load image from file
docker load < docker-web.tar.gz
```

---

## 🌍 Hosts File Management

```bash
# View hosts file
cat /etc/hosts | grep waris

# Add entry
echo "127.0.0.1 waris.local api.waris.local" | sudo tee -a /etc/hosts

# Remove entry (macOS)
sudo sed -i '' '/waris/d' /etc/hosts

# Flush DNS cache (macOS)
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

---

## 🐛 Git Commands (Bonus)

```bash
# Check status
git status

# View changes
git diff
git diff --staged

# Stage changes
git add .
git add platform/apps/web/

# Commit
git commit -m "fix: your message here"

# Push
git push origin main

# View log
git log --oneline -10

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard changes
git restore platform/apps/web/app/page.tsx
git restore .
```

---

## 🎯 One-Liner Diagnostics

```bash
# Check if everything is running
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "waris-(traefik|web|api|postgres|mongo|redis)"

# Check ports in use
lsof -i :3000,8000,8090,8443,8888 | awk 'NR>1 {print $1, $9}'

# Check service health
for service in waris-traefik waris-web waris-api waris-postgres; do
  echo -n "$service: "
  docker inspect --format='{{.State.Health.Status}}' $service 2>/dev/null || echo "No health check"
done

# Quick log errors
docker logs waris-web 2>&1 | grep -i error | tail -10

# Test all endpoints
for url in "http://localhost:3000" "http://localhost:8000" "http://localhost:8888"; do
  echo -n "$url: "
  curl -s -o /dev/null -w "%{http_code}\n" $url
done

# Disk space check
echo "Docker disk usage:"; docker system df
echo "Host disk usage:"; df -h / | tail -1
```

---

## 💡 Pro Tips

```bash
# Alias shortcuts (add to ~/.zshrc or ~/.bashrc)
alias dps='docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
alias dlogs='docker logs --tail 50 --timestamps'
alias dexec='docker exec -it'
alias dcup='docker compose up -d'
alias dcdown='docker compose down'
alias dcrestart='docker compose restart'

# Then use:
dps
dlogs waris-web
dexec waris-web sh
```

---

## 📞 Emergency Contacts

- **Slack**: #waris-dev
- **Docs**: `docs/` folder
- **GitHub Issues**: [project/issues](https://github.com/...)
- **Troubleshooting**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Lessons Learned**: [LESSONS_LEARNED.md](./LESSONS_LEARNED.md)

---

**สุดท้าย**: Bookmark หน้านี้หรือพิมพ์ออกมาวางไว้ข้างโต๊ะ จะประหยัดเวลาได้เยอะ! 📌
