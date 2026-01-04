# Project Overview
# ภาพรวมโครงการ

## Project Name
**WARIS** - Water Loss Intelligent Analysis and Reporting System
ระบบวิเคราะห์และรายงานข้อมูลน้ำสูญเสียอัจฉริยะด้วยปัญญาประดิษฐ์ร่วมกับโมเดลภาษาขนาดใหญ่

## Client
การประปาส่วนภูมิภาค (กปภ.) - Provincial Waterworks Authority (PWA)

## Project Duration
270 วัน (9 เดือน) นับถัดจากวันลงนามในสัญญา

## Budget
9,577,554.96 บาท (รวมภาษีมูลค่าเพิ่ม)

---

## Objectives (วัตถุประสงค์)

### 1. Primary Objective
พัฒนาและบูรณาการระบบวิเคราะห์และรายงานข้อมูลน้ำสูญเสียอัจฉริยะ ผ่านการถามและตอบด้วยเทคโนโลยี AI และ LLM

### 2. Secondary Objectives
- ยกระดับการบริหารจัดการน้ำสูญเสียให้รวดเร็วยิ่งขึ้น
- ปรับปรุงกระบวนการตรวจจับและวิเคราะห์ข้อมูลน้ำสูญเสีย
- สนับสนุนการวางแผนและการตัดสินใจเชิงยุทธศาสตร์

---

## Key Deliverables (ผลงานหลัก)

### Phase 1: Foundation (Day 1-30)
- [ ] NDA Documentation
- [ ] Project Plan
- [ ] Team Structure
- [ ] Inception Report

### Phase 2: Design (Day 31-120)
- [ ] User Requirements Document
- [ ] System Design Specification
- [ ] UX/UI Design

### Phase 3: Development (Day 121-140)
- [ ] On-Premise Server Installation
- [ ] G-Cloud Deployment
- [ ] DMAMA Integration
- [ ] Data Warehouse
- [ ] AI System (4 Models)
- [ ] LLM System (70B+)
- [ ] Dashboard & Q&A System
- [ ] System Testing
- [ ] User Manual

### Phase 4: Training & Handover (Day 141-270)
- [ ] Admin Training (1 day, 6 hours)
- [ ] User Training (1 day, 2 hours)
- [ ] Final Documentation

---

## Success Criteria (เกณฑ์ความสำเร็จ)

### AI Model Performance
| Model | Metric | Target |
|-------|--------|--------|
| Anomaly Detection | F1-Score | ≥ 0.85 |
| Pattern Recognition | Accuracy | ≥ 0.80 |
| Classification | AUC-ROC | ≥ 0.85 |
| Time-series | MAPE | ≤ 15% |

### System Performance
| Metric | Target |
|--------|--------|
| API Response Time | < 2 seconds |
| Dashboard Load Time | < 3 seconds |
| LLM Response Time | < 10 seconds |
| System Uptime | ≥ 99.5% |

### User Acceptance
- 40 users trained successfully
- User satisfaction score ≥ 4.0/5.0

---

## Stakeholders (ผู้มีส่วนได้ส่วนเสีย)

### Primary
- กปภ. สำนักงานใหญ่
- กปภ. เขต (Regional offices)
- กปภ. สาขา (Branch offices)

### Secondary
- กองบริหารระบบข้อมูลสารสนเทศ
- คณะกรรมการตรวจรับพัสดุ

---

## Constraints (ข้อจำกัด)

### Technical
- Air-gapped LLM deployment (no internet)
- On-premise GPU server required
- Thai language primary requirement

### Regulatory
- PDPA Compliance
- ISO/IEC 42001 alignment
- OWASP security standards

### Resources
- 12 team members minimum
- 270 days timeline
- Fixed budget

---

## Risks (ความเสี่ยง)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data quality issues | High | Data profiling, cleaning pipeline |
| Model performance below target | High | Multiple approaches, baseline comparison |
| Integration complexity with DMAMA | Medium | Early integration testing |
| Thai LLM accuracy | Medium | Fine-tuning, gold standard dataset |
| Hardware procurement delays | Medium | Early ordering, backup plans |

---

## Communication Plan

### Meetings
- Monthly progress report to คณะกรรมการตรวจรับพัสดุ
- Weekly team sync
- Bi-weekly stakeholder updates

### Channels
- Official: Email, formal documents
- Working: Team collaboration platform
- Emergency: Direct phone contact

---

## Document References

| Document | Location |
|----------|----------|
| TOR (Terms of Reference) | [tor.csv](../requirements/tor.csv) |
| System Architecture | [architecture/overview.md](../architecture/overview.md) |
| API Specification | [api/overview.md](../api/overview.md) |
| Database Design | [database/overview.md](../database/overview.md) |
