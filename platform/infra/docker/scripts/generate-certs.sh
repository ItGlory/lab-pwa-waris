#!/bin/bash

# Generate self-signed SSL certificates for local WARIS development
# Usage: ./generate-certs.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}WARIS - SSL Certificate Generator${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Certificate directory
CERT_DIR="../traefik/certs"
mkdir -p "$CERT_DIR"

# Configuration
DOMAIN="waris.local"
DAYS=365
COUNTRY="TH"
STATE="Bangkok"
CITY="Bangkok"
ORG="Provincial Waterworks Authority"
OU="IT Department"

echo -e "${YELLOW}Generating SSL certificates for:${NC}"
echo -e "  Domain: ${GREEN}*.waris.local${NC}"
echo -e "  Validity: ${GREEN}${DAYS} days${NC}\n"

# Generate CA key and certificate
echo -e "${BLUE}[1/4] Generating Certificate Authority (CA)...${NC}"
openssl genrsa -out "$CERT_DIR/ca.key" 4096 2>/dev/null

openssl req -new -x509 -days $DAYS -key "$CERT_DIR/ca.key" -out "$CERT_DIR/ca.crt" \
  -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/OU=$OU/CN=WARIS Local CA" 2>/dev/null

echo -e "${GREEN}✓ CA certificate created${NC}\n"

# Generate server key
echo -e "${BLUE}[2/4] Generating server private key...${NC}"
openssl genrsa -out "$CERT_DIR/$DOMAIN.key" 2048 2>/dev/null
echo -e "${GREEN}✓ Server key created${NC}\n"

# Create certificate signing request (CSR)
echo -e "${BLUE}[3/4] Creating certificate signing request...${NC}"
openssl req -new -key "$CERT_DIR/$DOMAIN.key" -out "$CERT_DIR/$DOMAIN.csr" \
  -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/OU=$OU/CN=*.$DOMAIN" 2>/dev/null
echo -e "${GREEN}✓ CSR created${NC}\n"

# Create SAN configuration file
cat > "$CERT_DIR/san.cnf" << EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C=$COUNTRY
ST=$STATE
L=$CITY
O=$ORG
OU=$OU
CN=*.$DOMAIN

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = $DOMAIN
DNS.2 = *.$DOMAIN
DNS.3 = localhost
DNS.4 = *.localhost
DNS.5 = waris.local
DNS.6 = *.waris.local
DNS.7 = api.waris.local
DNS.8 = traefik.waris.local
DNS.9 = pgadmin.waris.local
DNS.10 = mongo.waris.local
DNS.11 = redis.waris.local
DNS.12 = minio.waris.local
DNS.13 = s3.waris.local
DNS.14 = mlflow.waris.local
DNS.15 = llm.waris.local
DNS.16 = ai.waris.local
DNS.17 = milvus.waris.local
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

# Sign the certificate with CA
echo -e "${BLUE}[4/4] Signing certificate with CA...${NC}"
openssl x509 -req -in "$CERT_DIR/$DOMAIN.csr" -CA "$CERT_DIR/ca.crt" -CAkey "$CERT_DIR/ca.key" \
  -CAcreateserial -out "$CERT_DIR/$DOMAIN.crt" -days $DAYS \
  -extensions v3_req -extfile "$CERT_DIR/san.cnf" 2>/dev/null

echo -e "${GREEN}✓ Certificate signed${NC}\n"

# Clean up
rm "$CERT_DIR/$DOMAIN.csr" "$CERT_DIR/san.cnf" "$CERT_DIR/ca.srl"

# Set permissions
chmod 644 "$CERT_DIR"/*.crt
chmod 600 "$CERT_DIR"/*.key

# Verify certificate
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Certificate Information${NC}"
echo -e "${BLUE}========================================${NC}\n"

openssl x509 -in "$CERT_DIR/$DOMAIN.crt" -noout -subject -dates -ext subjectAltName

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}SSL Certificates Generated Successfully!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "Certificate files created in: ${YELLOW}$CERT_DIR${NC}\n"

echo -e "${YELLOW}Next steps:${NC}\n"
echo -e "1. Trust the CA certificate on your system:"
echo -e "   ${BLUE}macOS:${NC}"
echo -e "   sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain $CERT_DIR/ca.crt\n"
echo -e "   ${BLUE}Linux:${NC}"
echo -e "   sudo cp $CERT_DIR/ca.crt /usr/local/share/ca-certificates/waris-ca.crt"
echo -e "   sudo update-ca-certificates\n"
echo -e "   ${BLUE}Windows:${NC}"
echo -e "   Import ca.crt to 'Trusted Root Certification Authorities'\n"

echo -e "2. Add domains to /etc/hosts:"
echo -e "   ${BLUE}sudo nano /etc/hosts${NC}\n"
echo -e "   Add these lines:"
echo -e "   ${YELLOW}127.0.0.1 waris.local${NC}"
echo -e "   ${YELLOW}127.0.0.1 api.waris.local${NC}"
echo -e "   ${YELLOW}127.0.0.1 traefik.waris.local${NC}"
echo -e "   ${YELLOW}127.0.0.1 pgadmin.waris.local${NC}"
echo -e "   ${YELLOW}127.0.0.1 mongo.waris.local${NC}"
echo -e "   ${YELLOW}127.0.0.1 redis.waris.local${NC}"
echo -e "   ${YELLOW}127.0.0.1 minio.waris.local${NC}"
echo -e "   ${YELLOW}127.0.0.1 s3.waris.local${NC}"
echo -e "   ${YELLOW}127.0.0.1 mlflow.waris.local${NC}"
echo -e "   ${YELLOW}127.0.0.1 llm.waris.local${NC}"
echo -e "   ${YELLOW}127.0.0.1 ai.waris.local${NC}"
echo -e "   ${YELLOW}127.0.0.1 milvus.waris.local${NC}\n"

echo -e "3. Start WARIS with Traefik:"
echo -e "   ${BLUE}cd ../..${NC}"
echo -e "   ${BLUE}docker compose -f docker-compose.traefik.yml up -d${NC}\n"

echo -e "${GREEN}Happy secure coding! 🔒${NC}\n"
