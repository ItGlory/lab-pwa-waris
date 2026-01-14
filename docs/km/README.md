# WARIS Knowledge Management (KM)

> ฐานความรู้สำหรับระบบ RAG (Retrieval-Augmented Generation) ของ WARIS AI Assistant

## โครงสร้างความรู้

```
docs/km/
├── water-loss/          # ความรู้เรื่องน้ำสูญเสีย
│   ├── 01-nrw-basics.md
│   ├── 02-physical-loss.md
│   ├── 03-commercial-loss.md
│   └── 04-loss-reduction.md
├── pwa-operations/      # การดำเนินงานของ กปภ.
│   ├── 01-organization.md
│   ├── 02-service-areas.md
│   └── 03-processes.md
├── dma-management/      # การจัดการ DMA
│   ├── 01-dma-basics.md
│   ├── 02-monitoring.md
│   └── 03-analysis.md
├── standards/           # มาตรฐานและแนวปฏิบัติ
│   ├── 01-iwa-standards.md
│   └── 02-pwa-guidelines.md
└── glossary/            # คำศัพท์และคำจำกัดความ
    ├── 01-thai-english.md
    └── 02-technical-terms.md
```

## การใช้งานกับ RAG

เอกสารในโฟลเดอร์นี้จะถูก:
1. **Index** - แปลงเป็น vector embeddings เก็บใน Milvus
2. **Retrieve** - ดึงข้อมูลที่เกี่ยวข้องเมื่อผู้ใช้ถาม
3. **Augment** - ใส่เป็น context ให้ LLM ตอบได้แม่นยำ

## รูปแบบเอกสาร

ทุกไฟล์ใช้รูปแบบ Markdown พร้อม frontmatter:

```markdown
---
title: ชื่อหัวข้อ
category: หมวดหมู่
keywords: [คำสำคัญ, keyword1, keyword2]
updated: 2567-01-15
---

# หัวข้อ

เนื้อหา...
```

## การอัปเดตความรู้

1. แก้ไขไฟล์ใน `docs/km/`
2. รัน re-index script:
   ```bash
   python scripts/reindex_km.py
   ```
3. ตรวจสอบผ่าน admin dashboard
