#!/bin/bash

# WARIS Quick Start Script
# This script helps you set up WARIS for local development

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
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

check_command() {
    if command -v $1 &> /dev/null; then
        print_success "$1 is installed"
        return 0
    else
        print_error "$1 is not installed"
        return 1
    fi
}

# Banner
clear
echo -e "${BLUE}"
cat << "EOF"
 __      __  ___  ________ _________ ________
/  \    /  \/   \ \______ \\______  \\_____  \
\   \/\/   /  ^  \ |    |  \|    |  \_(__  <
 \        /  / \  \|       \|       \/       \
  \__/\  /  /___\  \______/_/_____  /______  /
       \/                          \/       \/
Water Loss Intelligent Analysis and Reporting System
EOF
echo -e "${NC}\n"

print_header "WARIS Quick Start - Local Development Setup"

# Step 1: Check prerequisites
print_header "Step 1: Checking Prerequisites"

PREREQUISITES_OK=true

# Check Node.js
if check_command node; then
    NODE_VERSION=$(node --version)
    print_info "Node.js version: $NODE_VERSION"
else
    PREREQUISITES_OK=false
fi

# Check npm
if check_command npm; then
    NPM_VERSION=$(npm --version)
    print_info "npm version: $NPM_VERSION"
else
    PREREQUISITES_OK=false
fi

# Check Docker
if check_command docker; then
    DOCKER_VERSION=$(docker --version)
    print_info "$DOCKER_VERSION"
else
    PREREQUISITES_OK=false
fi

# Check Docker Compose
if docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version)
    print_success "Docker Compose is installed"
    print_info "$COMPOSE_VERSION"
else
    print_error "Docker Compose is not installed"
    PREREQUISITES_OK=false
fi

# Check Python
if check_command python3; then
    PYTHON_VERSION=$(python3 --version)
    print_info "$PYTHON_VERSION"
else
    PREREQUISITES_OK=false
fi

if [ "$PREREQUISITES_OK" = false ]; then
    print_error "Some prerequisites are missing. Please install them and try again."
    echo -e "\nRequired software:"
    echo "  - Node.js 22+ (https://nodejs.org)"
    echo "  - Docker & Docker Compose (https://docker.com)"
    echo "  - Python 3.12+ (https://python.org)"
    exit 1
fi

print_success "All prerequisites are installed!"

# Step 2: Environment setup
print_header "Step 2: Environment Configuration"

if [ -f ".env" ]; then
    print_warning ".env file already exists"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp .env.example .env
        print_success "Created new .env file"
    else
        print_info "Keeping existing .env file"
    fi
else
    cp .env.example .env
    print_success "Created .env file from template"
fi

# Step 3: Start Docker services
print_header "Step 3: Starting Infrastructure Services"

cd infra/docker

print_info "Starting PostgreSQL, MongoDB, Redis, and pgAdmin..."
docker compose -f docker-compose.dev.yml up -d postgres redis mongodb pgadmin

print_info "Waiting for services to be healthy (this may take 30-60 seconds)..."
sleep 10

# Check service health
print_info "Checking service status..."
docker compose -f docker-compose.dev.yml ps

cd ../..

print_success "Infrastructure services are starting up"

# Step 4: Install Node.js dependencies
print_header "Step 4: Installing Node.js Dependencies"

if [ -d "node_modules" ]; then
    print_warning "node_modules directory already exists"
    read -p "Do you want to reinstall dependencies? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Installing dependencies..."
        npm install
        print_success "Dependencies installed"
    else
        print_info "Skipping dependency installation"
    fi
else
    print_info "Installing dependencies (this may take a few minutes)..."
    npm install
    print_success "Dependencies installed"
fi

# Step 5: Setup Python virtual environment (optional)
print_header "Step 5: Python Environment Setup (Optional)"

read -p "Do you want to set up Python virtual environment for API development? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd apps/api

    if [ -d "venv" ]; then
        print_warning "Virtual environment already exists"
    else
        print_info "Creating Python virtual environment..."
        python3 -m venv venv
        print_success "Virtual environment created"
    fi

    print_info "Activating virtual environment..."
    source venv/bin/activate

    print_info "Installing Python dependencies..."
    pip install --upgrade pip
    pip install fastapi uvicorn sqlalchemy asyncpg pymongo redis pydantic python-jose passlib bcrypt python-multipart python-dotenv

    print_success "Python environment ready"
    print_warning "To activate the virtual environment in the future, run:"
    echo -e "  ${YELLOW}cd apps/api && source venv/bin/activate${NC}"

    cd ../..
else
    print_info "Skipping Python environment setup"
fi

# Step 6: Database initialization
print_header "Step 6: Database Initialization"

print_info "Waiting for databases to be fully ready..."
sleep 20

print_info "Checking database connections..."

# Test PostgreSQL
if docker exec waris-postgres pg_isready -U waris &> /dev/null; then
    print_success "PostgreSQL is ready"
else
    print_warning "PostgreSQL might not be fully ready yet"
fi

# Test Redis
if docker exec waris-redis redis-cli ping &> /dev/null; then
    print_success "Redis is ready"
else
    print_warning "Redis might not be fully ready yet"
fi

# Test MongoDB
if docker exec waris-mongodb mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
    print_success "MongoDB is ready"
else
    print_warning "MongoDB might not be fully ready yet"
fi

# Completion
print_header "Setup Complete! 🎉"

echo -e "${GREEN}WARIS is ready for local development!${NC}\n"

echo -e "Next steps:\n"
echo -e "  1. Start the development servers:"
echo -e "     ${YELLOW}npm run dev${NC}\n"

echo -e "  2. Access the services:"
echo -e "     • Frontend:         ${BLUE}http://localhost:3000${NC}"
echo -e "     • Backend API:      ${BLUE}http://localhost:8000${NC}"
echo -e "     • API Docs:         ${BLUE}http://localhost:8000/docs${NC}"
echo -e "     • pgAdmin:          ${BLUE}http://localhost:5050${NC}"
echo -e "       (email: admin@waris.local, password: admin)\n"

echo -e "  3. Useful commands:"
echo -e "     • View Docker logs:  ${YELLOW}cd infra/docker && docker compose -f docker-compose.dev.yml logs -f${NC}"
echo -e "     • Stop services:     ${YELLOW}cd infra/docker && docker compose -f docker-compose.dev.yml down${NC}"
echo -e "     • Run tests:         ${YELLOW}npm test${NC}"
echo -e "     • Check code:        ${YELLOW}npm run lint${NC}\n"

echo -e "  4. Read the documentation:"
echo -e "     • Local Setup Guide: ${BLUE}../LOCAL_SETUP.md${NC}"
echo -e "     • README:            ${BLUE}../README.md${NC}"
echo -e "     • Project Docs:      ${BLUE}../docs/${NC}\n"

print_warning "Note: If you encounter any issues, check the troubleshooting section in LOCAL_SETUP.md"

echo -e "\n${GREEN}Happy coding! 🚀${NC}\n"
