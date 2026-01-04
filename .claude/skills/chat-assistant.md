# /chat-assistant

Interactive Q&A system for water loss management queries.

## Description
RAG-powered conversational AI assistant for querying water loss data and generating insights in Thai language.

## Usage
```
/chat-assistant [query]
```

## Parameters
- `query`: Natural language question in Thai or English

## Capabilities

### Data Queries (การสอบถามข้อมูล)
- "แสดงข้อมูลน้ำสูญเสียของ DMA สาขาบางพลี"
- "เปรียบเทียบอัตราน้ำสูญเสียระหว่างเขต 1 และเขต 2"
- "สรุปรายงานการซ่อมท่อเดือนที่แล้ว"

### Analysis Requests (การขอวิเคราะห์)
- "วิเคราะห์แนวโน้มน้ำสูญเสียใน 6 เดือนที่ผ่านมา"
- "ระบุพื้นที่ที่มีความเสี่ยงสูงต่อการรั่วไหล"
- "คาดการณ์ปริมาณน้ำสูญเสียในไตรมาสหน้า"

### Technical Support (สนับสนุนทางเทคนิค)
- "วิธีการตรวจสอบมาตรวัดน้ำ"
- "ขั้นตอนการซ่อมท่อแตกรั่ว"
- "มาตรฐานการตรวจสอบ DMA"

### Report Generation (การสร้างรายงาน)
- "สร้างสรุปผู้บริหารประจำสัปดาห์"
- "จัดทำรายงานประสิทธิภาพ DMA"

## RAG Pipeline

1. **Query Processing**
   - Parse Thai/English input
   - Extract entities (DMA, dates, metrics)
   - Generate embedding vector

2. **Document Retrieval**
   - Search Vector Database (Milvus)
   - Retrieve relevant documents
   - Rank by semantic similarity

3. **Context Assembly**
   - Combine retrieved documents
   - Add real-time data from DMAMA
   - Include user permissions context

4. **Response Generation**
   - Use LLM (70B+ Thai-capable)
   - Apply guardrails for safety
   - Format response appropriately

## Guardrails
- No sensitive data exposure
- Factual accuracy verification
- Appropriate content filtering
- Source citation requirement
- Rate limiting per user
