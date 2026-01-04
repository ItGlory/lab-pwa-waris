# Hybrid Infrastructure
# โครงสร้างพื้นฐานแบบผสมผสาน

## Overview

WARIS uses a hybrid architecture combining on-premise GPU server with Government Cloud (G-Cloud) for backup and scaling.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           HYBRID ARCHITECTURE                                │
├────────────────────────────────────┬────────────────────────────────────────┤
│         ON-PREMISE                 │              G-CLOUD                   │
│      (Primary Processing)          │         (Backup & Scale)               │
├────────────────────────────────────┼────────────────────────────────────────┤
│                                    │                                         │
│  ┌──────────────────────────────┐  │  ┌──────────────────────────────────┐  │
│  │     GPU SERVER               │  │  │     COMPUTE                       │  │
│  │  • LLM Inference (70B+)      │  │  │  • Model Training                │  │
│  │  • AI Model Serving          │  │  │  • Batch Processing              │  │
│  │  • Real-time Analysis        │  │  │  • Overflow Processing           │  │
│  └──────────────────────────────┘  │  └──────────────────────────────────┘  │
│                                    │                                         │
│  ┌──────────────────────────────┐  │  ┌──────────────────────────────────┐  │
│  │     APPLICATION              │  │  │     BACKUP                        │  │
│  │  • Web Application           │  │  │  • Database Backup               │  │
│  │  • API Services              │  │  │  • Vector DB Backup              │  │
│  │  • Dashboard                 │  │  │  • Model Artifacts               │  │
│  └──────────────────────────────┘  │  └──────────────────────────────────┘  │
│                                    │                                         │
│  ┌──────────────────────────────┐  │  ┌──────────────────────────────────┐  │
│  │     DATA                     │  │  │     DR SITE                       │  │
│  │  • PostgreSQL (Primary)      │◄─┼──┤  • PostgreSQL (Standby)          │  │
│  │  • MongoDB (Primary)         │◄─┼──┤  • MongoDB (Replica)             │  │
│  │  • Milvus (Primary)          │◄─┼──┤  • Milvus (Backup)               │  │
│  │  • Redis (Primary)           │  │  │  • Cold Storage                  │  │
│  └──────────────────────────────┘  │  └──────────────────────────────────┘  │
│                                    │                                         │
│         VPN / Private Link         │                                         │
│  ◄─────────────────────────────────►                                        │
│                                    │                                         │
└────────────────────────────────────┴────────────────────────────────────────┘
```

---

## On-Premise Infrastructure

### Server Specifications (TOR 4.2.1)

| Component | Specification |
|-----------|---------------|
| **CPU** | 2x Intel Xeon (25+ cores, 2.2GHz+) |
| **L3 Cache** | ≥ 55MB |
| **RAM** | 512GB DDR5 |
| **Storage** | 5x 3.5TB NVMe SSD (Hot-swap) |
| **RAID** | RAID 0/1/10/5/50/6/60 |
| **Network** | 5x 10/25Gb ports |
| **GPU** | 2x NVIDIA A100/H100 (48GB GDDR6) |
| | Peak FP32: 51.6+ TFLOPS |
| | Peak FP16 Tensor: 322+ TFLOPS |
| **Management** | IPMI 2.0, REST API, TPM 2.0 |
| **Power** | Redundant PSU (Hot-swap) |
| **Cooling** | Redundant fans |
| **Warranty** | 3 years on-site |

### Server Rack Layout

```
┌─────────────────────────────────────┐
│           RACK LAYOUT               │
├─────────────────────────────────────┤
│  U42  │  Network Switch             │
│  U41  │  Network Switch (Redundant) │
├───────┼─────────────────────────────┤
│  U40  │  KVM / Console              │
├───────┼─────────────────────────────┤
│  U39  │                             │
│  U38  │  GPU SERVER                 │
│  U37  │  (4U)                       │
│  U36  │                             │
├───────┼─────────────────────────────┤
│  U35  │  UPS                        │
│  U34  │                             │
├───────┼─────────────────────────────┤
│  U33  │  Storage (Future)           │
│  ...  │                             │
│  U1   │  Reserved                   │
└───────┴─────────────────────────────┘

Location: กปภ. สำนักงานใหญ่ อาคาร 4 ชั้น 2 ห้องศูนย์คอมพิวเตอร์
```

### Network Architecture

```
                     ┌─────────────┐
                     │   Internet  │
                     └──────┬──────┘
                            │
                     ┌──────▼──────┐
                     │  Firewall   │
                     └──────┬──────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
       ┌──────▼──────┐             ┌──────▼──────┐
       │  DMZ Zone   │             │ Internal    │
       │  (Web/API)  │             │ Zone (AI)   │
       └─────────────┘             └─────────────┘
              │                           │
              └─────────────┬─────────────┘
                            │
                     ┌──────▼──────┐
                     │  Database   │
                     │  Zone       │
                     └─────────────┘
```

---

## G-Cloud Infrastructure

### Services Used

| Service | Purpose |
|---------|---------|
| **Compute** | Model training, batch processing |
| **Storage** | Backup, cold storage |
| **Database** | Standby replicas |
| **Network** | VPN connectivity |

### Backup Strategy

```yaml
Database Backup:
  Frequency: Daily (incremental), Weekly (full)
  Retention: 30 days
  Method: pg_dump, mongodump
  Destination: G-Cloud Object Storage

Vector Database Backup:
  Frequency: Daily
  Retention: 14 days
  Method: Milvus backup utility
  Destination: G-Cloud Object Storage

Model Artifacts:
  Frequency: On change
  Retention: 5 versions
  Method: MLflow artifact store
  Destination: G-Cloud Object Storage
```

---

## Disaster Recovery

### RPO/RTO Targets

| Metric | Target |
|--------|--------|
| RPO (Recovery Point Objective) | 1 hour |
| RTO (Recovery Time Objective) | 4 hours |

### Failover Procedure

```
1. Detect failure (automated monitoring)
2. Notify operations team
3. Verify G-Cloud standby status
4. Switch DNS to G-Cloud
5. Activate standby databases
6. Verify service health
7. Notify users
8. Document incident
```

### Failback Procedure

```
1. Repair on-premise infrastructure
2. Sync data from G-Cloud
3. Verify data integrity
4. Test on-premise services
5. Schedule maintenance window
6. Switch DNS back to on-premise
7. Verify service health
8. Deactivate G-Cloud failover mode
```

---

## Data Synchronization

### Real-time Sync (Critical Data)
```yaml
Method: Streaming replication
Lag Target: < 1 minute
Data Types:
  - Water loss readings
  - Alert events
  - User sessions
```

### Batch Sync (Non-critical Data)
```yaml
Method: Scheduled jobs
Frequency: Every 6 hours
Data Types:
  - Historical reports
  - Audit logs
  - Model metrics
```

### Vector Database Sync
```yaml
Method: Daily backup + restore
Frequency: Daily
Note: Vector DB sync is eventual consistency
```

---

## Security Considerations

### Network Security
- VPN tunnel between on-premise and G-Cloud
- Encrypted data in transit (TLS 1.3)
- IP whitelisting
- DDoS protection

### Data Security
- Encryption at rest (AES-256)
- Key management (Vault)
- Access logging
- Data masking for sensitive fields

### Compliance
- No data leaves Thailand (G-Cloud Thailand region)
- PDPA compliance
- Government data classification standards

---

## Monitoring & Alerting

### On-Premise Monitoring
```yaml
Tool: Prometheus + Grafana
Metrics:
  - Server health (CPU, RAM, GPU, Disk)
  - Application metrics
  - Database performance
  - Network throughput
Alerting: PagerDuty/Email/LINE
```

### G-Cloud Monitoring
```yaml
Tool: G-Cloud native monitoring
Metrics:
  - Resource utilization
  - Backup status
  - Replication lag
  - Cost tracking
```

---

## Cost Optimization

### On-Premise
- GPU utilization optimization
- Resource scheduling
- Power management

### G-Cloud
- Reserved instances for baseline
- Spot instances for training
- Data lifecycle policies
- Right-sizing recommendations
