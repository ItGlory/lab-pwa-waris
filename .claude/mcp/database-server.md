# WARIS Database MCP Server

## Purpose
Provides Claude Code access to the WARIS centralized database for water loss data queries.

## Configuration
```json
{
  "name": "waris-database",
  "command": "node",
  "args": ["mcp-servers/database/index.js"]
}
```

## Environment Variables
- `WARIS_DATABASE_URL`: PostgreSQL connection string
- `DATABASE_POOL_SIZE`: Connection pool size (default: 10)
- `DATABASE_TIMEOUT`: Query timeout in ms (default: 30000)

## Available Tools

### query_water_loss
Query water loss data for specific DMA and date range.
```typescript
interface QueryWaterLossParams {
  dma_id?: string;
  start_date: string;
  end_date: string;
  aggregation?: 'hourly' | 'daily' | 'weekly' | 'monthly';
}
```

### get_dma_list
Retrieve list of all DMAs with their metadata.
```typescript
interface GetDMAListParams {
  region?: string;
  branch?: string;
  include_stats?: boolean;
}
```

### get_consumption_data
Get water consumption data for users in a DMA.
```typescript
interface GetConsumptionDataParams {
  dma_id: string;
  start_date: string;
  end_date: string;
  user_type?: 'residential' | 'commercial' | 'industrial';
}
```

### get_repair_records
Retrieve pipe repair records.
```typescript
interface GetRepairRecordsParams {
  dma_id?: string;
  start_date: string;
  end_date: string;
  repair_type?: 'leak' | 'burst' | 'replacement';
}
```

### get_meter_readings
Get meter readings with flow and pressure data.
```typescript
interface GetMeterReadingsParams {
  meter_id?: string;
  dma_id?: string;
  start_date: string;
  end_date: string;
}
```

## Security
- Read-only access by default
- Role-based access control
- Query logging for audit
- Connection encryption (TLS)

## Data Schema
Follows the centralized database schema per TOR 4.4.1
