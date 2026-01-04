# TOR Summary
# สรุปข้อกำหนดขอบเขตงาน

## TOR Sections Overview

### Section 4.1: Project Management (การบริหารโครงการ)
- NDA signing within 15 days
- Kick-off meeting within 15 days
- Monthly progress reports
- DevSecOps practices
- OWASP compliance

### Section 4.2: System Architecture (สถาปัตยกรรมระบบ)

#### 4.2.1 On-Premise Server Specifications
| Component | Specification |
|-----------|---------------|
| CPU | 2x 25+ cores, 2.2GHz+ |
| L3 Cache | ≥ 55MB |
| RAM | 512GB DDR5 |
| Storage | 5x 3.5TB SSD (Hot-swap) |
| Network | 5x 10/25Gb ports |
| GPU | 2x 48GB GDDR6, 51.6+ TFLOPS FP32 |
| Warranty | 3 years on-site |

#### 4.2.2 G-Cloud Integration
- Hybrid architecture support
- AI/ML workload processing
- No vendor lock-in
- Data portability

### Section 4.3: Data Integration (การเชื่อมต่อข้อมูล)
- DMAMA system integration
- API / Direct DB / File import support
- Data quality validation
- ETL pipeline development
- Data Flow Diagram
- Metadata & Data Catalog

### Section 4.4: Data Warehouse (คลังข้อมูล)

#### 4.4.1 Centralized Database
- Multi-format support (SQL, NoSQL, Cloud)
- Role-based Access Control
- Backup & Recovery
- Data Quality checks
- Automated data collection

#### 4.4.2 Data Storage
- Multi-format support (images, documents, video, audio)

#### 4.4.3 Vector Database
- High-performance embeddings storage
- Vector Similarity Search
- Semantic Search
- Backup to G-Cloud

#### 4.4.4 Data Types
- Water user data (ข้อมูลผู้ใช้น้ำ)
- Operational data (การผลิตและจำหน่าย)
- Pipe repair records (ข้อมูลการซ่อมท่อ)
- GIS data

### Section 4.5: AI System Development (การพัฒนาระบบ AI)

#### 4.5.1 AI Shadowing (4 Models)
| Model | Purpose |
|-------|---------|
| Anomaly Detection | ตรวจจับสัญญาณผิดปกติ |
| Pattern Recognition | รูปแบบการใช้น้ำผิดปกติ |
| Classification | แยกแยะน้ำสูญเสียกายภาพ/พาณิชย์ |
| Time-series Prediction | ทำนายแนวโน้มน้ำสูญเสีย |

**Requirements:**
- Minimum 2 approaches per model
- Compare with baseline (Rule-based/Statistical)
- Performance metrics: Precision, Recall, F1-score
- Test with agreed dataset

#### 4.5.2 LLM System
| Requirement | Specification |
|-------------|---------------|
| Model Size | ≥ 70B parameters |
| Language | Thai support required |
| Deployment | On-premise, air-gapped |
| Security | No external data transmission |

#### 4.5.3 Notification System
- Web application alerts
- Integration with กปภ. platform
- 60-day alert history with timestamps

#### 4.5.4 Dashboard & Q&A System

**Dashboard Requirements (4.5.4.1):**
- Role-based access by region
- Daily view granularity
- Download capability
- Charts: Line, Pie, Bar
- ≥ 3 interactive dashboards
- 1-level drill-down minimum
- Custom date range filtering

**Q&A System Requirements (4.5.4.2):**
- Thai language support
- Configurable daily conversation limits
- 30-day conversation history

**Document Support (4.5.4.3):**
- Upload: .docx, .pdf
- Knowledge base updates
- Source tracking

**RAG System (4.5.4.5):**
- Embedding support
- Vector Search

**Gold Standard Dataset (4.5.4.6):**
- Domain-specific test data
- Water loss analysis reports
- Technical Q&A pairs
- Executive summaries

#### 4.5.5 ISO/IEC 42001 Compliance
- AI Management System standards
- Transparency
- Safety
- Risk control

#### 4.5.6 AI Guardrails
- Prevent misinformation
- Content filtering
- Risk prevention

### Section 4.6: System Testing (การทดสอบระบบ)
- Test planning
- System Integration Testing (SIT)
- User Acceptance Testing (UAT)
- Performance Testing
- Security Testing
- Test documentation

### Section 4.7: Training (การฝึกอบรม)
| Course | Duration | Attendees |
|--------|----------|-----------|
| Admin/Technical Staff | 1 day (6 hours) | 40 people |
| End Users | 1 day (2 hours) | 40 people |

**Requirements:**
- Training venue provided by contractor
- Lunch and refreshments included
- Training materials (printed + electronic)

---

## Deliverable Schedule

### งวดที่ 1 (Day 30) - 15%
1. NDA Documentation
2. Project Plan
3. Team Structure Report
4. Inception Report
5. Progress Report

### งวดที่ 2 (Day 120) - 30%
1. User Requirements Document
2. System Design Specification
3. UX/UI Design
4. Progress Report

### งวดที่ 3 (Day 140) - 40%
1. Server Installation + Diagram
2. G-Cloud Deployment
3. DMAMA Integration
4. Data Warehouse
5. AI System
6. Test Report
7. User Manual

### งวดที่ 4 (Day 270) - 15%
1. Training Summary
2. Final Documentation

---

## Penalty Clauses

### Late Delivery
- 0.1% per day of contract value
- Minimum 100 THB/day

### Support Response
| Type | Response | Resolution |
|------|----------|------------|
| Critical (system down) | 6 hours | 1 day |
| Other issues | 1 day | 5 days |

- Late support: 0.025% per day

### Contract Termination
- Penalty exceeds 10% of contract value
