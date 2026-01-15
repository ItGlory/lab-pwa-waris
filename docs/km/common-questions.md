---
title: คำถามที่พบบ่อย (Common Questions Index)
category: index
keywords: [FAQ, คำถาม, ถามตอบ, Q&A, ช่วยเหลือ, help]
updated: 2567-01-15
---

# คำถามที่พบบ่อยเกี่ยวกับน้ำสูญเสีย

> รวบรวมคำถามที่ผู้ใช้มักถามบ่อย เพื่อให้ AI ตอบได้ตรงประเด็น

---

## คำถามพื้นฐาน (Basic Questions)

### น้ำสูญเสีย (NRW)

| คำถาม | คำตอบสั้น | อ่านเพิ่มเติม |
|-------|-----------|---------------|
| NRW คืออะไร? | น้ำที่ผลิตแล้วแต่ไม่สามารถเก็บรายได้ได้ | water-loss/01-nrw-basics.md |
| NRW มีกี่ประเภท? | 3 ประเภท: Real Losses, Apparent Losses, Unbilled Authorized | water-loss/01-nrw-basics.md |
| NRW ควรอยู่ที่เท่าไหร่? | มาตรฐาน IWA < 20%, กปภ. เป้าหมาย < 20% (2570) | standards/01-iwa-standards.md |
| สาเหตุหลักของน้ำสูญเสีย? | ท่อรั่ว มิเตอร์ผิดพลาด และลักน้ำ | water-loss/01-nrw-basics.md |

### DMA (พื้นที่จ่ายน้ำย่อย)

| คำถาม | คำตอบสั้น | อ่านเพิ่มเติม |
|-------|-----------|---------------|
| DMA คืออะไร? | พื้นที่จ่ายน้ำที่แยกออกมาวัดปริมาณน้ำเข้า-ออก | dma-management/01-dma-basics.md |
| DMA ควรมีขนาดเท่าไหร่? | 1,000-2,500 ราย, ความยาวท่อ 10-25 กม. | dma-management/01-dma-basics.md |
| ประโยชน์ของ DMA? | ตรวจจับรั่วเร็ว แคบพื้นที่ค้นหา ควบคุมแรงดันได้ | dma-management/01-dma-basics.md |
| ขั้นตอนจัดตั้ง DMA? | 4 ขั้นตอน: วางแผน ติดตั้งอุปกรณ์ ทดสอบ ติดตามผล | dma-management/01-dma-basics.md |

### กปภ. (การประปาส่วนภูมิภาค)

| คำถาม | คำตอบสั้น | อ่านเพิ่มเติม |
|-------|-----------|---------------|
| กปภ. คืออะไร? | รัฐวิสาหกิจผลิตและจำหน่ายน้ำประปา 74 จังหวัด | pwa-operations/01-organization.md |
| กปภ. มีกี่เขต? | 10 เขต ทั่วประเทศ | pwa-operations/02-service-areas.md |
| เป้าหมาย NRW ของ กปภ.? | ลดเหลือ < 20% ภายในปี 2570 | pwa-operations/01-organization.md |
| DMAMA คืออะไร? | ระบบบริหารจัดการ DMA ของ กปภ. | pwa-operations/01-organization.md |

---

## คำถามเชิงเทคนิค (Technical Questions)

### ตัวชี้วัด (KPIs)

| คำถาม | คำตอบสั้น | อ่านเพิ่มเติม |
|-------|-----------|---------------|
| ILI คืออะไร? | Infrastructure Leakage Index = CARL/UARL | water-loss/02-physical-loss.md |
| ILI เท่าไหร่ถือว่าดี? | ILI 1-2 ดีเยี่ยม, 2-4 ดี, 4-8 ปานกลาง, >8 ต้องปรับปรุง | standards/01-iwa-standards.md |
| MNF คืออะไร? | Minimum Night Flow อัตราไหลต่ำสุดกลางคืน (02:00-04:00) | dma-management/02-monitoring.md |
| MNF ใช้ทำอะไร? | ชี้วัดน้ำสูญเสียทางกายภาพ | dma-management/02-monitoring.md |
| Water Balance คืออะไร? | การคำนวณสมดุลน้ำตาม IWA Framework | dma-management/03-analysis.md |

### การคำนวณ (Calculations)

| คำถาม | สูตร | อ่านเพิ่มเติม |
|-------|------|---------------|
| คำนวณ NRW อย่างไร? | NRW (%) = (SIV - Billed) / SIV × 100 | water-loss/01-nrw-basics.md |
| คำนวณ ILI อย่างไร? | ILI = CARL / UARL | water-loss/02-physical-loss.md |
| UARL คืออะไร? | น้ำสูญเสียที่หลีกเลี่ยงไม่ได้ ขึ้นกับความยาวท่อและจุดเชื่อมต่อ | standards/01-iwa-standards.md |
| คำนวณความผิดพลาดมิเตอร์? | (Q อ้างอิง - Q มิเตอร์) / Q อ้างอิง × 100 | water-loss/03-commercial-loss.md |

### อุปกรณ์ (Equipment)

| คำถาม | คำตอบสั้น | อ่านเพิ่มเติม |
|-------|-----------|---------------|
| PRV คืออะไร? | Pressure Reducing Valve วาล์วลดแรงดัน | glossary/01-thai-english.md |
| PRV ช่วยลด NRW ได้อย่างไร? | ลดแรงดัน = ลดอัตราการรั่ว 20-40% | water-loss/04-loss-reduction.md |
| Data Logger คืออะไร? | อุปกรณ์บันทึกอัตราไหลและแรงดัน | dma-management/02-monitoring.md |
| Smart Meter คืออะไร? | มิเตอร์อัจฉริยะส่งข้อมูลอัตโนมัติ | glossary/01-thai-english.md |

---

## คำถามเชิงปฏิบัติ (Practical Questions)

### การตรวจจับรั่ว

| คำถาม | คำตอบสั้น | อ่านเพิ่มเติม |
|-------|-----------|---------------|
| วิธีหาจุดรั่วมีอะไรบ้าง? | Acoustic Listening, Ground Mic, Correlator, Step Test | water-loss/02-physical-loss.md |
| Active Leak Detection คืออะไร? | การสำรวจรั่วเชิงรุก ไม่รอให้ประชาชนแจ้ง | water-loss/02-physical-loss.md |
| MNF สูงแปลว่าอะไร? | มีการรั่วไหลมาก ต้องสำรวจหาจุดรั่ว | dma-management/02-monitoring.md |

### การจัดการมิเตอร์

| คำถาม | คำตอบสั้น | อ่านเพิ่มเติม |
|-------|-----------|---------------|
| ควรเปลี่ยนมิเตอร์เมื่อไหร่? | อายุเกิน 5-7 ปี หรือทดสอบแล้วผิดพลาดเกินมาตรฐาน | water-loss/03-commercial-loss.md |
| มิเตอร์เดินช้าเกิดจากอะไร? | กลไกสึกหรอ อายุการใช้งาน | water-loss/03-commercial-loss.md |
| ตรวจสอบมิเตอร์บ่อยแค่ไหน? | ทุก 2-3 ปี | standards/02-pwa-guidelines.md |

### การลดน้ำสูญเสีย

| คำถาม | คำตอบสั้น | อ่านเพิ่มเติม |
|-------|-----------|---------------|
| วิธีลดน้ำสูญเสียมีอะไรบ้าง? | IWA 4 Pillars: ALC, Speed of Repair, PM, Infrastructure | water-loss/04-loss-reduction.md |
| วิธีไหนได้ผลดีที่สุด? | Pressure Management ลดได้ 20-40% | water-loss/04-loss-reduction.md |
| ต้องลงทุนเท่าไหร่? | ขึ้นกับขนาดพื้นที่และสภาพท่อ | water-loss/04-loss-reduction.md |

---

## คำถามด้วยภาษาพูด (Colloquial Questions)

> คำถามที่ผู้ใช้อาจถามในชีวิตประจำวัน

| คำถามภาษาพูด | ความหมาย | คำตอบ |
|--------------|----------|-------|
| น้ำหายไปไหน? | น้ำสูญเสียจากอะไร? | ส่วนใหญ่รั่วจากท่อ ส่วนหนึ่งวัดไม่ได้ อีกส่วนถูกลัก |
| ทำไมค่าน้ำสูง? | สาเหตุค่าน้ำแพง | อาจมีท่อรั่วในบ้าน มิเตอร์ปกติ หรือใช้น้ำมากขึ้น |
| ท่อรั่วในบ้านรู้ได้ไง? | วิธีตรวจสอบท่อรั่ว | ปิดน้ำทั้งบ้าน ดูมิเตอร์ ถ้ายังหมุนแสดงว่ารั่ว |
| แจ้งท่อรั่วที่ไหน? | ช่องทางแจ้งเหตุ | โทร 1662 หรือแอป PWA 1662 |
| กปภ.เขตไหนดูแลบ้านฉัน? | หาเขตที่รับผิดชอบ | ดูจากจังหวัด ใน pwa-operations/02-service-areas.md |

---

## คำย่อที่ควรรู้ (Important Abbreviations)

| คำย่อ | ย่อมาจาก | ความหมายไทย |
|-------|----------|-------------|
| NRW | Non-Revenue Water | น้ำสูญเสีย |
| DMA | District Metered Area | พื้นที่จ่ายน้ำย่อย |
| MNF | Minimum Night Flow | อัตราไหลต่ำสุดกลางคืน |
| ILI | Infrastructure Leakage Index | ดัชนีโครงสร้างรั่วไหล |
| PRV | Pressure Reducing Valve | วาล์วลดแรงดัน |
| ALC | Active Leakage Control | การควบคุมรั่วเชิงรุก |
| CARL | Current Annual Real Losses | น้ำสูญเสียจริงต่อปี |
| UARL | Unavoidable Annual Real Losses | น้ำสูญเสียที่หลีกเลี่ยงไม่ได้ |
| SIV | System Input Volume | ปริมาณน้ำเข้าระบบ |
| AZP | Average Zone Pressure | แรงดันเฉลี่ยในพื้นที่ |
| กปภ. | การประปาส่วนภูมิภาค | Provincial Waterworks Authority |
| IWA | International Water Association | สมาคมน้ำสากล |

---

## หมายเหตุสำหรับ RAG

เอกสารนี้ออกแบบมาเพื่อ:
1. **Index คำถาม** - รวบรวมคำถามไว้ที่เดียว
2. **ลิงก์ไปเอกสารหลัก** - อ้างอิงรายละเอียดเพิ่มเติม
3. **รองรับภาษาพูด** - คำถามที่ใช้ในชีวิตประจำวัน
4. **คำย่อสำคัญ** - ช่วยแปลความหมาย

RAG Pipeline ควร:
- ใช้เอกสารนี้เป็น first-pass retrieval
- ดึงเอกสารหลักเมื่อต้องการรายละเอียด
- Match ทั้งคำถามทางการและภาษาพูด
