#!/bin/bash

# WARIS Traefik Quick Start Script
# This script sets up and starts WARIS with Traefik reverse proxy

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Banner
clear
echo -e "${BLUE}"
cat << "EOF"
 _____ ____      _    _____ _____ ___ _  __
|_   _|  _ \    / \  | ____|  ___|_ _| |/ /
  | | | |_) |  / _ \ |  _| | |_   | || ' /
  | | |  _ <  / ___ \| |___|  _|  | || . \
  |_| |_| \_\/_/   \_\_____|_|   |___|_|\_\

WARIS - Traefik Reverse Proxy Setup
EOF
echo -e "${NC}\n"

print_header "WARIS Traefik Setup - Local Development with SSL"

# Check if running from correct directory
if [ ! -f "../docker-compose.traefik.yml" ]; then
    print_error "Please run this script from platform/infra/docker/scripts/"
    exit 1
fi

# Step 1: Check certificates
print_header "Step 1: Checking SSL Certificates"

CERT_DIR="../traefik/certs"

if [ ! -f "$CERT_DIR/waris.local.crt" ] || [ ! -f "$CERT_DIR/waris.local.key" ]; then
    print_warning "SSL certificates not found"
    read -p "Do you want to generate them now? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        print_info "Generating SSL certificates..."
        ./generate-certs.sh
    else
        print_error "SSL certificates are required. Exiting."
        exit 1
    fi
else
    print_success "SSL certificates found"
fi

# Step 2: Check hosts file
print_header "Step 2: Checking /etc/hosts Configuration"

if grep -q "waris.local" /etc/hosts 2>/dev/null; then
    print_success "/etc/hosts already configured"
else
    print_warning "/etc/hosts not configured"
    echo -e "\nYou need to add these entries to /etc/hosts:\n"
    echo -e "${YELLOW}127.0.0.1 waris.local${NC}"
    echo -e "${YELLOW}127.0.0.1 api.waris.local${NC}"
    echo -e "${YELLOW}127.0.0.1 ai.waris.local${NC}"
    echo -e "${YELLOW}127.0.0.1 traefik.waris.local${NC}"
    echo -e "${YELLOW}127.0.0.1 pgadmin.waris.local${NC}"
    echo -e "${YELLOW}127.0.0.1 mongo.waris.local${NC}"
    echo -e "${YELLOW}127.0.0.1 redis.waris.local${NC}"
    echo -e "${YELLOW}127.0.0.1 minio.waris.local${NC}"
    echo -e "${YELLOW}127.0.0.1 mlflow.waris.local${NC}"
    echo -e "${YELLOW}127.0.0.1 llm.waris.local${NC}\n"

    read -p "Do you want to add them automatically? (requires sudo) (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        print_info "Adding entries to /etc/hosts..."
        echo "" | sudo tee -a /etc/hosts > /dev/null
        echo "# WARIS Local Development" | sudo tee -a /etc/hosts > /dev/null
        echo "127.0.0.1 waris.local" | sudo tee -a /etc/hosts > /dev/null
        echo "127.0.0.1 api.waris.local" | sudo tee -a /etc/hosts > /dev/null
        echo "127.0.0.1 ai.waris.local" | sudo tee -a /etc/hosts > /dev/null
        echo "127.0.0.1 traefik.waris.local" | sudo tee -a /etc/hosts > /dev/null
        echo "127.0.0.1 pgadmin.waris.local" | sudo tee -a /etc/hosts > /dev/null
        echo "127.0.0.1 mongo.waris.local" | sudo tee -a /etc/hosts > /dev/null
        echo "127.0.0.1 redis.waris.local" | sudo tee -a /etc/hosts > /dev/null
        echo "127.0.0.1 minio.waris.local" | sudo tee -a /etc/hosts > /dev/null
        echo "127.0.0.1 mlflow.waris.local" | sudo tee -a /etc/hosts > /dev/null
        echo "127.0.0.1 llm.waris.local" | sudo tee -a /etc/hosts > /dev/null
        print_success "/etc/hosts configured"
    else
        print_warning "Please add them manually and run this script again"
        exit 1
    fi
fi

# Step 3: Check CA certificate trust
print_header "Step 3: Checking CA Certificate Trust"

CA_INSTALLED=false

# Check if CA is trusted (macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    if security find-certificate -c "WARIS Local CA" -a &>/dev/null; then
        CA_INSTALLED=true
    fi
fi

if [ "$CA_INSTALLED" = true ]; then
    print_success "CA certificate is trusted"
else
    print_warning "CA certificate is not trusted by system"
    echo -e "\nTo trust the certificate:\n"

    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo -e "${YELLOW}sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain $CERT_DIR/ca.crt${NC}\n"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo -e "${YELLOW}sudo cp $CERT_DIR/ca.crt /usr/local/share/ca-certificates/waris-ca.crt${NC}"
        echo -e "${YELLOW}sudo update-ca-certificates${NC}\n"
    fi

    read -p "Do you want to trust it now? (requires sudo) (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain "$CERT_DIR/ca.crt"
            print_success "CA certificate trusted"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo cp "$CERT_DIR/ca.crt" /usr/local/share/ca-certificates/waris-ca.crt
            sudo update-ca-certificates
            print_success "CA certificate trusted"
        fi
    else
        print_warning "Browser may show security warnings"
    fi
fi

# Step 4: Stop existing services
print_header "Step 4: Checking for Existing Services"

cd ..

if docker compose -f docker-compose.traefik.yml ps | grep -q "Up"; then
    print_warning "WARIS services are already running"
    read -p "Do you want to restart them? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Stopping services..."
        docker compose -f docker-compose.traefik.yml down
        print_success "Services stopped"
    else
        print_info "Keeping services running"
        exit 0
    fi
fi

# Check for other docker-compose services
if docker compose -f docker-compose.dev.yml ps 2>/dev/null | grep -q "Up"; then
    print_warning "Development services (docker-compose.dev.yml) are running"
    read -p "Do you want to stop them? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        docker compose -f docker-compose.dev.yml down
        print_success "Development services stopped"
    fi
fi

# Step 5: Start Traefik stack
print_header "Step 5: Starting WARIS with Traefik"

print_info "Pulling latest images..."
docker compose -f docker-compose.traefik.yml pull

print_info "Starting services (this may take 2-3 minutes)..."
docker compose -f docker-compose.traefik.yml up -d

print_success "Services started"

# Step 6: Wait for services
print_header "Step 6: Waiting for Services to be Ready"

print_info "Waiting for Traefik..."
sleep 5

print_info "Waiting for databases..."
sleep 15

print_info "Waiting for applications..."
sleep 10

# Check service health
print_info "Checking service status..."
docker compose -f docker-compose.traefik.yml ps

# Completion
print_header "Setup Complete! 🎉"

echo -e "${GREEN}WARIS is running with Traefik reverse proxy!${NC}\n"

echo -e "${BLUE}📍 Access your services:${NC}\n"

echo -e "  ${GREEN}Main Applications:${NC}"
echo -e "  • Frontend:        ${YELLOW}https://waris.local${NC}"
echo -e "  • API:             ${YELLOW}https://api.waris.local${NC}"
echo -e "  • API Docs:        ${YELLOW}https://api.waris.local/docs${NC}"
echo -e "  • AI Services:     ${YELLOW}https://ai.waris.local${NC}\n"

echo -e "  ${GREEN}Admin Tools:${NC}"
echo -e "  • Traefik:         ${YELLOW}https://traefik.waris.local:8080${NC}"
echo -e "  • pgAdmin:         ${YELLOW}https://pgadmin.waris.local${NC} (admin@waris.local / admin)"
echo -e "  • Mongo Express:   ${YELLOW}https://mongo.waris.local${NC} (admin / admin)"
echo -e "  • Redis Commander: ${YELLOW}https://redis.waris.local${NC}"
echo -e "  • MinIO Console:   ${YELLOW}https://minio.waris.local${NC} (minioadmin / minioadmin)"
echo -e "  • MLflow:          ${YELLOW}https://mlflow.waris.local${NC}\n"

echo -e "${BLUE}📝 Useful commands:${NC}\n"
echo -e "  • View logs:       ${YELLOW}docker compose -f docker-compose.traefik.yml logs -f${NC}"
echo -e "  • Stop services:   ${YELLOW}docker compose -f docker-compose.traefik.yml down${NC}"
echo -e "  • Restart service: ${YELLOW}docker compose -f docker-compose.traefik.yml restart <service>${NC}"
echo -e "  • Service status:  ${YELLOW}docker compose -f docker-compose.traefik.yml ps${NC}\n"

echo -e "${BLUE}📚 Documentation:${NC}"
echo -e "  • Traefik Setup:   ${YELLOW}../../../../TRAEFIK_SETUP.md${NC}"
echo -e "  • Local Setup:     ${YELLOW}../../../../LOCAL_SETUP.md${NC}"
echo -e "  • Project README:  ${YELLOW}../../../../README.md${NC}\n"

print_warning "Note: First request may be slow as services initialize. Please wait 30 seconds before accessing."

echo -e "\n${GREEN}Happy coding with Traefik! 🚀🔒${NC}\n"
