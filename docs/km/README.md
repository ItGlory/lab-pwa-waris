---
title: WARIS Knowledge Management
category: index
keywords: [knowledge management, RAG, WARIS, น้ำสูญเสีย, กปภ.]
updated: 2567-01-15
---

# WARIS Knowledge Management (KM)

> ฐานความรู้สำหรับระบบ RAG (Retrieval-Augmented Generation) ของ WARIS AI Assistant
> เพื่อให้ AI สามารถตอบคำถามเกี่ยวกับน้ำสูญเสียและการจัดการระบบประปาได้อย่างแม่นยำ

---

## โครงสร้างความรู้

```
docs/km/
├── water-loss/              # ความรู้เรื่องน้ำสูญเสีย
│   ├── 01-nrw-basics.md        - พื้นฐานน้ำสูญเสีย (NRW)
│   ├── 02-physical-loss.md     - น้ำสูญเสียทางกายภาพ (Real Losses)
│   ├── 03-commercial-loss.md   - น้ำสูญเสียเชิงพาณิชย์ (Apparent Losses)
│   └── 04-loss-reduction.md    - แนวทางลดน้ำสูญเสีย (IWA 4 Pillars)
│
├── dma-management/          # การจัดการ DMA
│   ├── 01-dma-basics.md        - พื้นฐาน DMA
│   ├── 02-monitoring.md        - การติดตาม DMA (MNF, SCADA)
│   └── 03-analysis.md          - การวิเคราะห์ DMA (Water Balance, ILI)
│
├── pwa-operations/          # การดำเนินงานของ กปภ.
│   ├── 01-organization.md      - โครงสร้างองค์กร กปภ.
│   ├── 02-service-areas.md     - พื้นที่ให้บริการ 10 เขต
│   └── 03-processes.md         - กระบวนการดำเนินงาน
│
├── standards/               # มาตรฐานและแนวปฏิบัติ
│   ├── 01-iwa-standards.md     - มาตรฐาน IWA สากล
│   └── 02-pwa-guidelines.md    - แนวปฏิบัติ กปภ.
│
├── glossary/                # คำศัพท์และคำจำกัดความ
│   ├── 01-thai-english.md      - คำศัพท์ไทย-อังกฤษ
│   ├── 02-technical-terms.md   - คำศัพท์เทคนิค
│   └── 03-colloquial-terms.md  - คำศัพท์ภาษาพูดและคำพ้อง
│
├── scenarios/               # สถานการณ์และคำแนะนำ
│   ├── 01-troubleshooting.md   - การแก้ไขปัญหาน้ำสูญเสีย
│   └── 02-recommendations.md   - คำแนะนำตามสถานการณ์
│
└── common-questions.md      # รวมคำถามที่พบบ่อย (FAQ Index)
```

---

## สรุปเนื้อหาแต่ละหมวด

### Water Loss (น้ำสูญเสีย)

| ไฟล์ | เนื้อหาหลัก |
|-----|------------|
| 01-nrw-basics | NRW คืออะไร, องค์ประกอบ 3 ส่วน, เป้าหมายมาตรฐาน |
| 02-physical-loss | Real Losses, ประเภทการรั่วไหล, ILI, การตรวจจับ |
| 03-commercial-loss | Apparent Losses, มิเตอร์ผิดพลาด, ลักน้ำ |
| 04-loss-reduction | IWA 4 Pillars, แผนปฏิบัติการ, KPIs |

### DMA Management (การจัดการ DMA)

| ไฟล์ | เนื้อหาหลัก |
|-----|------------|
| 01-dma-basics | DMA คืออะไร, ขนาดมาตรฐาน, ขั้นตอนจัดตั้ง |
| 02-monitoring | MNF, Data Logger, SCADA, ระบบแจ้งเตือน |
| 03-analysis | Water Balance, ILI, Economic Analysis |

### PWA Operations (การดำเนินงาน กปภ.)

| ไฟล์ | เนื้อหาหลัก |
|-----|------------|
| 01-organization | โครงสร้างองค์กร, วิสัยทัศน์, DMAMA |
| 02-service-areas | 10 เขต, สถิติ, ลักษณะภูมิภาค |
| 03-processes | การผลิตน้ำ, การจ่ายน้ำ, การเก็บค่าน้ำ |

### Standards (มาตรฐาน)

| ไฟล์ | เนื้อหาหลัก |
|-----|------------|
| 01-iwa-standards | Water Balance Framework, ILI, 4 Pillars |
| 02-pwa-guidelines | เป้าหมาย NRW, SOP, มาตรฐานอุปกรณ์ |

### Glossary (คำศัพท์)

| ไฟล์ | เนื้อหาหลัก |
|-----|------------|
| 01-thai-english | คำศัพท์หลัก, หน่วยวัด, ตัวย่อ |
| 02-technical-terms | คำศัพท์วิศวกรรม, SCADA, สถิติ |
| 03-colloquial-terms | คำภาษาพูด, คำพ้องความหมาย, Search Query Mapping |

### Scenarios (สถานการณ์)

| ไฟล์ | เนื้อหาหลัก |
|-----|------------|
| 01-troubleshooting | การแก้ไขปัญหา, Decision Tree, วิเคราะห์สาเหตุ |
| 02-recommendations | คำแนะนำตามสถานการณ์, การเลือกอุปกรณ์, เป้าหมาย |

### Special Documents (เอกสารพิเศษ)

| ไฟล์ | เนื้อหาหลัก |
|-----|------------|
| common-questions.md | รวม FAQ ทั้งหมด, คำถามภาษาพูด, คำย่อสำคัญ |

---

## การใช้งานกับ RAG

### Pipeline การทำงาน

```
┌─────────────────────────────────────────────────────────────┐
│                    RAG PIPELINE                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. INDEXING (ทำครั้งเดียว/เมื่ออัปเดต)                      │
│     Documents → Chunking → Embedding → Milvus Store          │
│     (Markdown)   (512 tok)   (ada-002)   (Vector DB)         │
│                                                              │
│  2. RETRIEVAL (ทุกครั้งที่ถาม)                               │
│     User Query → Embedding → Vector Search → Top K Chunks    │
│                   (ada-002)   (Milvus)       (Relevant)      │
│                                                              │
│  3. GENERATION (สร้างคำตอบ)                                  │
│     Context + Query → Prompt Build → LLM → Response          │
│                                       (Thai)                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### การ Index เอกสาร

```bash
# Index เอกสารทั้งหมด
python platform/apps/api/scripts/index_knowledge.py

# Index เฉพาะโฟลเดอร์
python platform/apps/api/scripts/index_knowledge.py --path docs/km/water-loss/

# ตรวจสอบสถานะ
curl http://localhost:8000/api/v1/knowledge/status
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/knowledge/search` | POST | ค้นหาความรู้ |
| `/api/v1/knowledge/index` | POST | Index เอกสารใหม่ |
| `/api/v1/knowledge/status` | GET | สถานะ Index |
| `/api/v1/chat/rag` | POST | RAG-enhanced Chat |

---

## รูปแบบเอกสาร

### Frontmatter (บังคับ)

ทุกไฟล์ต้องมี YAML frontmatter:

```markdown
---
title: ชื่อหัวข้อ (ไทย + English)
category: หมวดหมู่ (water-loss, dma-management, etc.)
keywords: [คำสำคัญ, keyword1, keyword2]
updated: 2567-01-15
---

# หัวข้อหลัก

เนื้อหา...
```

### โครงสร้างเนื้อหา (แนะนำ)

```markdown
# หัวข้อหลัก

## คำจำกัดความ

...

## เนื้อหาหลัก

...

## ตารางข้อมูล

| หัวข้อ | ค่า |
|-------|-----|
| ... | ... |

---

## คำถามที่พบบ่อย (FAQ)

### Q: คำถาม?

**A:** คำตอบ...

### Q: คำถาม?

**A:** คำตอบ...
```

### Best Practices สำหรับ RAG

1. **ใช้ภาษาไทยเป็นหลัก** - ผู้ใช้ส่วนใหญ่ถามเป็นภาษาไทย
2. **ใส่คำศัพท์อังกฤษกำกับ** - ช่วยค้นหาได้ทั้งสองภาษา
3. **เพิ่ม FAQ ทุกไฟล์** - ช่วยให้ RAG ตอบคำถามตรงประเด็น
4. **ใช้ keyword หลากหลาย** - ทั้งคำเต็ม ตัวย่อ และคำที่ใช้บ่อย
5. **แยกหัวข้อชัดเจน** - Chunking จะได้ผลดีกว่า
6. **หลีกเลี่ยงเนื้อหาซ้ำซ้อน** - ลดความสับสนของ AI

---

## การอัปเดตความรู้

### ขั้นตอนการอัปเดต

1. **แก้ไขไฟล์** ใน `docs/km/`
2. **อัปเดต frontmatter** (updated date)
3. **รัน re-index**:

   ```bash
   python scripts/reindex_km.py
   ```

4. **ตรวจสอบ** ผ่าน admin dashboard หรือ API

### การเพิ่มเอกสารใหม่

1. สร้างไฟล์ในโฟลเดอร์ที่เหมาะสม
2. ใส่ frontmatter ครบถ้วน
3. ทำตามรูปแบบเอกสารมาตรฐาน
4. เพิ่ม FAQ section
5. รัน index script

---

## ตัวอย่างคำถามที่ RAG ตอบได้

### คำถามพื้นฐาน

- "NRW คืออะไร?"
- "DMA มีประโยชน์อย่างไร?"
- "วิธีลดน้ำสูญเสียมีอะไรบ้าง?"

### คำถามเชิงเทคนิค

- "ILI คำนวณอย่างไร?"
- "MNF ควรอยู่ที่เท่าไหร่?"
- "UARL สูตรคำนวณคืออะไร?"

### คำถามเกี่ยวกับ กปภ.

- "กปภ. มีกี่เขต?"
- "เป้าหมาย NRW ของ กปภ. คือเท่าไหร่?"
- "DMAMA คืออะไร?"

### คำถามเชิงปฏิบัติ

- "ขั้นตอนจัดตั้ง DMA มีอะไรบ้าง?"
- "ควรเปลี่ยนมิเตอร์เมื่อไหร่?"
- "PRV ช่วยลดน้ำสูญเสียได้อย่างไร?"

---

## ข้อมูลเพิ่มเติม

- [RAG Pipeline Documentation](../plan/11-rag-pipeline-milvus.md)
- [AI/ML Overview](../ai-ml/01-overview.md)
- [API Documentation](../api/01-overview.md)
