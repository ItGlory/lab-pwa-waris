# /generate-report

Generate automated water loss reports for different stakeholders.

## Description
Creates comprehensive reports for executives, technical staff, and operational teams based on AI analysis.

## Usage
```
/generate-report [report_type] [format]
```

## Parameters
- `report_type`: Type of report (daily | weekly | monthly | executive | technical | operational)
- `format`: Output format (pdf | docx | html | dashboard)

## Report Types

### Daily Report (รายงานประจำวัน)
- Current water loss status by DMA
- Anomalies detected in last 24 hours
- Critical alerts and notifications
- Immediate action items

### Weekly Report (รายงานประจำสัปดาห์)
- Weekly trend analysis
- Comparison with previous weeks
- Performance metrics by region
- Maintenance activities summary

### Monthly Report (รายงานประจำเดือน)
- Monthly KPI achievement
- Financial impact analysis
- Repair and maintenance summary
- Strategic recommendations

### Executive Summary (สรุปผู้บริหาร)
- High-level overview
- Key metrics and KPIs
- Strategic insights
- Decision support data

### Technical Report (รายงานเทคนิค)
- Detailed technical analysis
- Model performance metrics
- Data quality assessment
- System health status

## Instructions

1. Gather data from Vector Database and DMAMA
2. Run AI analysis pipeline
3. Generate visualizations using the dashboard components
4. Compile report in requested format
5. Apply กปภ. branding and templates
6. Store in document repository

## Thai Language Support
All reports support Thai language with proper formatting for:
- Thai numerals (optional)
- Buddhist calendar dates
- Thai terminology for water management
