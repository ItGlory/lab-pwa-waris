# Security Overview
# ภาพรวมความปลอดภัย

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYERS                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────── PERIMETER SECURITY ─────────────────────────┐  │
│  │  • Firewall  • DDoS Protection  • WAF  • SSL/TLS                      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────── NETWORK SECURITY ───────────────────────────┐  │
│  │  • VPN  • Network Segmentation  • Zero Trust  • mTLS                  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────── APPLICATION SECURITY ───────────────────────┐  │
│  │  • Authentication  • Authorization  • Input Validation  • OWASP       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────── DATA SECURITY ──────────────────────────────┐  │
│  │  • Encryption at Rest  • Encryption in Transit  • Key Management      │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌────────────────────────── AI SECURITY ────────────────────────────────┐  │
│  │  • Guardrails  • Air-gapped LLM  • Model Security  • Data Privacy     │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Compliance Requirements

### OWASP Top 10 (TOR 4.1.8)

| Risk | Mitigation |
|------|------------|
| A01:2021 Broken Access Control | RBAC, least privilege |
| A02:2021 Cryptographic Failures | TLS 1.3, AES-256 |
| A03:2021 Injection | Parameterized queries, input validation |
| A04:2021 Insecure Design | Threat modeling, secure SDLC |
| A05:2021 Security Misconfiguration | Infrastructure as Code, scanning |
| A06:2021 Vulnerable Components | Dependency scanning, updates |
| A07:2021 Auth Failures | MFA, session management |
| A08:2021 Software/Data Integrity | Code signing, CI/CD security |
| A09:2021 Logging Failures | Centralized logging, monitoring |
| A10:2021 SSRF | URL validation, network segmentation |

### PDPA Compliance (TOR 13)

| Requirement | Implementation |
|-------------|----------------|
| Consent Management | User consent tracking |
| Data Subject Rights | Self-service portal |
| Data Processing Agreement | Contractual terms |
| Data Breach Notification | Incident response plan |
| Privacy by Design | PIA for all features |
| Data Minimization | Collect only necessary data |
| Storage Limitation | Retention policies |

### ISO/IEC 42001 (TOR 4.5.5)

| Area | Control |
|------|---------|
| AI Governance | Policy, roles, responsibilities |
| Risk Management | AI-specific risk assessment |
| Data Governance | Quality, bias, privacy |
| Model Management | Versioning, validation, monitoring |
| Transparency | Explainability where possible |

---

## Authentication & Authorization

### Authentication Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │────►│  Login  │────►│   JWT   │────►│ Access  │
│         │     │  Form   │     │  Token  │     │ Granted │
└─────────┘     └────┬────┘     └─────────┘     └─────────┘
                     │
              ┌──────▼──────┐
              │   LDAP/AD   │
              │   (กปภ.)    │
              └─────────────┘
```

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| Admin | Full access, user management |
| Regional Manager | Region data, reports |
| Branch Operator | Branch data, alerts |
| Analyst | View data, reports |
| Viewer | Read-only access |

### Permission Matrix

| Resource | Admin | Manager | Operator | Analyst | Viewer |
|----------|-------|---------|----------|---------|--------|
| DMA Data | CRUD | RU | RU | R | R |
| Alerts | CRUD | RU | RU | R | R |
| Reports | CRUD | CRU | R | CR | R |
| Chat | CRUD | CRUD | CRUD | CRUD | CRUD |
| Users | CRUD | R | - | - | - |
| System Config | CRUD | - | - | - | - |

---

## Encryption

### Data at Rest

```yaml
Database:
  Type: AES-256
  Key Management: HashiCorp Vault
  Key Rotation: Monthly

File Storage:
  Type: AES-256-GCM
  Key Management: KMS

Backups:
  Type: AES-256
  Encryption: Client-side before upload
```

### Data in Transit

```yaml
External Traffic:
  Protocol: TLS 1.3
  Certificates: Let's Encrypt / CA

Internal Traffic:
  Protocol: mTLS
  Certificates: Internal CA

Database Connections:
  Protocol: TLS 1.2+
  Authentication: Certificate + Password
```

---

## AI Security (Guardrails)

### LLM Security Measures (TOR 4.5.6)

```python
class LLMGuardrails:
    """
    Security guardrails for LLM interactions
    """

    def validate_input(self, query: str) -> bool:
        """
        Input validation
        - Block prompt injection attempts
        - Filter inappropriate content
        - Validate query scope
        """
        if self.detect_injection(query):
            raise SecurityException("Potential prompt injection")
        if self.detect_inappropriate(query):
            raise ContentPolicyException("Inappropriate content")
        return True

    def validate_output(self, response: str) -> str:
        """
        Output validation
        - Verify factual accuracy (RAG grounding)
        - Filter sensitive information
        - Ensure source citation
        """
        response = self.filter_sensitive_data(response)
        response = self.verify_citations(response)
        return response

    def rate_limit(self, user_id: str) -> bool:
        """
        Per-user rate limiting
        - Daily conversation limit
        - Token limit per request
        """
        return self.check_daily_limit(user_id)
```

### Air-Gapped Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                    AIR-GAPPED ZONE                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐ │
│  │   LLM       │      │   Vector    │      │   Model     │ │
│  │   Server    │◄────►│   Database  │◄────►│   Registry  │ │
│  │   (70B+)    │      │  (Milvus)   │      │  (MLflow)   │ │
│  └─────────────┘      └─────────────┘      └─────────────┘ │
│         │                                                    │
│         │  NO EXTERNAL NETWORK ACCESS                       │
│         │                                                    │
│  ┌──────▼──────┐                                            │
│  │   Internal  │                                            │
│  │   API Only  │                                            │
│  └─────────────┘                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Network Security

### Network Segmentation

```
┌─────────────────────────────────────────────────────────────┐
│                    NETWORK ZONES                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐                                            │
│  │   DMZ       │  Public-facing (Web, API Gateway)          │
│  └──────┬──────┘                                            │
│         │                                                    │
│  ┌──────▼──────┐                                            │
│  │ Application │  Internal services (API, Services)         │
│  │    Zone     │                                            │
│  └──────┬──────┘                                            │
│         │                                                    │
│  ┌──────▼──────┐                                            │
│  │   AI Zone   │  GPU servers, LLM (Air-gapped)             │
│  └──────┬──────┘                                            │
│         │                                                    │
│  ┌──────▼──────┐                                            │
│  │  Data Zone  │  Databases, storage (Most restricted)      │
│  └─────────────┘                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Firewall Rules (Sample)

```yaml
# DMZ to Application
- rule: allow-web-to-api
  source: dmz
  destination: app-zone
  ports: [8000, 8001]
  protocol: tcp

# Application to Data
- rule: allow-api-to-db
  source: app-zone
  destination: data-zone
  ports: [5432, 27017, 19530]
  protocol: tcp

# AI Zone (Restricted)
- rule: allow-app-to-ai
  source: app-zone
  destination: ai-zone
  ports: [8080]
  protocol: tcp

- rule: deny-ai-external
  source: ai-zone
  destination: internet
  action: deny
```

---

## Logging & Monitoring

### Security Logging

```yaml
Logged Events:
  - Authentication attempts (success/failure)
  - Authorization decisions
  - Data access (read/write)
  - Admin actions
  - API requests
  - AI/LLM interactions
  - System changes

Log Format:
  timestamp: ISO8601
  event_type: string
  user_id: uuid
  ip_address: string
  resource: string
  action: string
  result: success/failure
  details: object
```

### Security Alerts

| Event | Severity | Response |
|-------|----------|----------|
| Failed login (5+ attempts) | High | Lock account |
| Unusual data access | Medium | Alert admin |
| Privilege escalation | Critical | Block + alert |
| AI guardrail triggered | Medium | Log + review |
| Database anomaly | High | Alert DBA |

---

## Incident Response

### Incident Classification

| Level | Description | Response Time |
|-------|-------------|---------------|
| Critical | System breach, data leak | Immediate |
| High | Service disruption | 1 hour |
| Medium | Security warning | 4 hours |
| Low | Minor issue | 24 hours |

### Response Procedure

```
1. Detection → Alert triggered
2. Triage → Classify severity
3. Containment → Isolate affected systems
4. Eradication → Remove threat
5. Recovery → Restore services
6. Lessons Learned → Post-incident review
```

---

## Security Checklist

### Development
- [ ] SAST (Static Analysis)
- [ ] DAST (Dynamic Analysis)
- [ ] Dependency scanning
- [ ] Code review
- [ ] Security testing

### Deployment
- [ ] Container scanning
- [ ] Infrastructure scanning
- [ ] Secrets management
- [ ] Network policies
- [ ] Access control verification

### Operations
- [ ] Vulnerability patching
- [ ] Log monitoring
- [ ] Incident response testing
- [ ] Backup verification
- [ ] Security training
