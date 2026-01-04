# Entity Relationship Diagram

## Core Entities

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CORE ENTITIES                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐    │
│  │    REGION    │ 1    n  │    BRANCH    │ 1    n  │     DMA      │    │
│  ├──────────────┤─────────├──────────────┤─────────├──────────────┤    │
│  │ id           │         │ id           │         │ id           │    │
│  │ code         │         │ code         │         │ code         │    │
│  │ name_th      │         │ name_th      │         │ name_th      │    │
│  │ name_en      │         │ name_en      │         │ name_en      │    │
│  └──────────────┘         │ region_id    │         │ branch_id    │    │
│                           └──────────────┘         │ area_km2     │    │
│                                                    │ population   │    │
│                                                    │ connections  │    │
│                                                    └──────────────┘    │
│                                                           │            │
│                                                           │ 1          │
│                                                           │            │
│                                                           │ n          │
│                                                    ┌──────────────┐    │
│                                                    │    METER     │    │
│                                                    ├──────────────┤    │
│                                                    │ id           │    │
│                                                    │ serial_no    │    │
│                                                    │ dma_id       │    │
│                                                    │ meter_type   │    │
│                                                    │ install_date │    │
│                                                    │ location     │    │
│                                                    └──────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Readings (Time-Series)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         READINGS ENTITIES                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐    │
│  │ FLOW_READING │         │PRESS_READING │         │METER_READING │    │
│  ├──────────────┤         ├──────────────┤         ├──────────────┤    │
│  │ id           │         │ id           │         │ id           │    │
│  │ dma_id (FK)  │         │ dma_id (FK)  │         │ meter_id(FK) │    │
│  │ recorded_at  │         │ recorded_at  │         │ recorded_at  │    │
│  │ flow_rate    │         │ pressure     │         │ reading      │    │
│  │ total_flow   │         │ min_pressure │         │ consumption  │    │
│  │ quality      │         │ max_pressure │         │ status       │    │
│  └──────────────┘         └──────────────┘         └──────────────┘    │
│         │                        │                        │             │
│         └────────────────────────┼────────────────────────┘             │
│                                  │                                       │
│                                  ▼                                       │
│                           ┌──────────────┐                              │
│                           │     DMA      │                              │
│                           └──────────────┘                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## User Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER ENTITIES                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐    │
│  │     USER     │ n    m  │  USER_ROLE   │ m    1  │     ROLE     │    │
│  ├──────────────┤─────────├──────────────┤─────────├──────────────┤    │
│  │ id           │         │ user_id (FK) │         │ id           │    │
│  │ email        │         │ role_id (FK) │         │ name         │    │
│  │ password_hash│         │ assigned_at  │         │ description  │    │
│  │ full_name    │         └──────────────┘         │ permissions  │    │
│  │ department   │                                  └──────────────┘    │
│  │ phone        │                                                       │
│  │ is_active    │         ┌──────────────┐                             │
│  │ created_at   │ 1    n  │  USER_DMA    │                             │
│  │ last_login   │─────────├──────────────┤                             │
│  └──────────────┘         │ user_id (FK) │                             │
│                           │ dma_id (FK)  │                             │
│                           │ access_level │                             │
│                           └──────────────┘                             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Analysis & Reports

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      ANALYSIS ENTITIES                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐    │
│  │NRW_ANALYSIS  │         │AI_PREDICTION │         │    ALERT     │    │
│  ├──────────────┤         ├──────────────┤         ├──────────────┤    │
│  │ id           │         │ id           │         │ id           │    │
│  │ dma_id (FK)  │         │ dma_id (FK)  │         │ dma_id (FK)  │    │
│  │ period_start │         │ model_type   │         │ alert_type   │    │
│  │ period_end   │         │ predicted_at │         │ severity     │    │
│  │ system_input │         │ prediction   │         │ message      │    │
│  │ billed_cons  │         │ confidence   │         │ created_at   │    │
│  │ nrw_volume   │         │ actual_value │         │ resolved_at  │    │
│  │ nrw_percent  │         └──────────────┘         │ resolved_by  │    │
│  │ ili_value    │                                  └──────────────┘    │
│  └──────────────┘                                                       │
│                                                                          │
│  ┌──────────────┐         ┌──────────────┐                             │
│  │    REPORT    │ 1    n  │REPORT_SECTION│                             │
│  ├──────────────┤─────────├──────────────┤                             │
│  │ id           │         │ id           │                             │
│  │ report_type  │         │ report_id(FK)│                             │
│  │ period       │         │ section_type │                             │
│  │ generated_at │         │ content      │                             │
│  │ generated_by │         │ order        │                             │
│  │ file_path    │         └──────────────┘                             │
│  │ status       │                                                       │
│  └──────────────┘                                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Spatial Entities

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       SPATIAL ENTITIES (PostGIS)                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐    │
│  │DMA_BOUNDARY  │         │ PIPE_SEGMENT │         │METER_LOCATION│    │
│  ├──────────────┤         ├──────────────┤         ├──────────────┤    │
│  │ id           │         │ id           │         │ id           │    │
│  │ dma_id (FK)  │         │ dma_id (FK)  │         │ meter_id(FK) │    │
│  │ geom (POLY)  │         │ geom (LINE)  │         │ geom (POINT) │    │
│  │ area_m2      │         │ length_m     │         │ address      │    │
│  │ perimeter_m  │         │ diameter_mm  │         │ accuracy_m   │    │
│  │ updated_at   │         │ material     │         │ updated_at   │    │
│  └──────────────┘         │ install_year │         └──────────────┘    │
│                           │ condition    │                              │
│                           └──────────────┘                              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Full ERD Diagram

```
                                    ┌────────────┐
                                    │   REGION   │
                                    └─────┬──────┘
                                          │
                                          │ 1:n
                                          ▼
                                    ┌────────────┐
                                    │   BRANCH   │
                                    └─────┬──────┘
                                          │
                                          │ 1:n
                                          ▼
┌────────────┐                     ┌────────────┐                    ┌────────────┐
│    USER    │──────n:m───────────>│    DMA     │<───────1:1─────────│DMA_BOUNDARY│
└─────┬──────┘                     └─────┬──────┘                    └────────────┘
      │                                  │
      │ 1:n                              ├───────────────────┬───────────────────┐
      ▼                                  │                   │                   │
┌────────────┐                           │ 1:n               │ 1:n               │ 1:n
│ USER_ROLE  │                           ▼                   ▼                   ▼
└────────────┘                    ┌────────────┐      ┌────────────┐      ┌────────────┐
      │                           │   METER    │      │FLOW_READING│      │   ALERT    │
      │ n:1                       └─────┬──────┘      └────────────┘      └────────────┘
      ▼                                 │
┌────────────┐                          │ 1:n
│    ROLE    │                          ▼
└────────────┘                   ┌────────────┐
                                 │METER_READING│
                                 └────────────┘
```

## Relationships Summary

| Parent | Child | Relationship | On Delete |
|--------|-------|--------------|-----------|
| region | branch | 1:n | RESTRICT |
| branch | dma | 1:n | RESTRICT |
| dma | meter | 1:n | RESTRICT |
| dma | flow_reading | 1:n | CASCADE |
| dma | pressure_reading | 1:n | CASCADE |
| meter | meter_reading | 1:n | CASCADE |
| dma | nrw_analysis | 1:n | CASCADE |
| dma | ai_prediction | 1:n | CASCADE |
| dma | alert | 1:n | SET NULL |
| user | user_role | 1:n | CASCADE |
| role | user_role | 1:n | CASCADE |
| dma | dma_boundary | 1:1 | CASCADE |

## Related Documents

- [Database Overview](./overview.md)
- [Tables](./tables.md)
- [Migrations](./migrations.md)
