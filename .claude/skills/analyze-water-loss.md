# /analyze-water-loss

Analyze water loss data from DMA (District Metering Area) system.

## Description
This skill analyzes water loss patterns, detects anomalies, and generates insights for water management.

## Usage
```
/analyze-water-loss [dma_id] [date_range]
```

## Parameters
- `dma_id`: Optional DMA identifier to analyze specific area
- `date_range`: Optional date range (e.g., "2024-01-01:2024-12-31")

## Instructions

1. Connect to the DMAMA database via the configured MCP server
2. Extract flow rate, pressure, and consumption data
3. Run anomaly detection algorithms
4. Classify water loss types (physical vs commercial)
5. Generate comprehensive analysis report

## Analysis Components

### Anomaly Detection
- Detect unusual flow patterns
- Identify pressure drops
- Flag meter irregularities

### Pattern Recognition
- Daily/weekly/monthly consumption patterns
- Seasonal variations
- Usage cluster analysis

### Classification
- Physical losses (pipe leaks, bursts)
- Commercial losses (meter errors, theft)

### Time-series Prediction
- Forecast future water loss trends
- Predict maintenance needs

## Output Format
Generate a structured report with:
- Executive summary
- Detailed findings by DMA
- Visualizations (charts/graphs)
- Recommendations
- Risk assessment
