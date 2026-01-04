# Database Tables

## Schema: public

### users

User accounts for the system.

```sql
CREATE TABLE public.users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    full_name_th    VARCHAR(255),
    department      VARCHAR(100),
    phone           VARCHAR(20),
    avatar_url      VARCHAR(500),
    is_active       BOOLEAN DEFAULT true,
    is_verified     BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    last_login      TIMESTAMPTZ,

    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON public.users (email);
CREATE INDEX idx_users_department ON public.users (department);
```

### roles

System roles for access control.

```sql
CREATE TABLE public.roles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(50) NOT NULL UNIQUE,
    description     TEXT,
    permissions     JSONB DEFAULT '[]',
    is_system       BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Default roles
INSERT INTO public.roles (name, description, permissions, is_system) VALUES
('admin', 'System Administrator', '["*"]', true),
('manager', 'Branch Manager', '["read:*", "write:reports", "write:alerts"]', true),
('analyst', 'Data Analyst', '["read:*", "write:analysis"]', true),
('operator', 'Field Operator', '["read:dma", "write:readings"]', true),
('viewer', 'Read Only', '["read:dashboard"]', true);
```

### user_roles

User-role assignments.

```sql
CREATE TABLE public.user_roles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role_id         UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    assigned_at     TIMESTAMPTZ DEFAULT NOW(),
    assigned_by     UUID REFERENCES public.users(id),

    UNIQUE(user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON public.user_roles (user_id);
```

## Schema: dma

### regions

PWA regional divisions.

```sql
CREATE TABLE dma.regions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(10) NOT NULL UNIQUE,
    name_th         VARCHAR(255) NOT NULL,
    name_en         VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 5 PWA Regions
INSERT INTO dma.regions (code, name_th, name_en) VALUES
('REG1', 'ภาคเหนือ', 'Northern'),
('REG2', 'ภาคกลาง', 'Central'),
('REG3', 'ภาคตะวันออก', 'Eastern'),
('REG4', 'ภาคตะวันออกเฉียงเหนือ', 'Northeastern'),
('REG5', 'ภาคใต้', 'Southern');
```

### branches

PWA branch offices.

```sql
CREATE TABLE dma.branches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(20) NOT NULL UNIQUE,
    name_th         VARCHAR(255) NOT NULL,
    name_en         VARCHAR(255),
    region_id       UUID NOT NULL REFERENCES dma.regions(id),
    address         TEXT,
    phone           VARCHAR(20),
    email           VARCHAR(255),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_branches_region ON dma.branches (region_id);
```

### dmas

District Metered Areas.

```sql
CREATE TABLE dma.dmas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(30) NOT NULL UNIQUE,
    name_th         VARCHAR(255) NOT NULL,
    name_en         VARCHAR(255),
    branch_id       UUID NOT NULL REFERENCES dma.branches(id),
    area_km2        DECIMAL(10,4),
    population      INTEGER,
    connections     INTEGER,
    pipe_length_km  DECIMAL(10,2),
    avg_pressure    DECIMAL(5,2),
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dmas_branch ON dma.dmas (branch_id);
CREATE INDEX idx_dmas_code ON dma.dmas (code);
```

### meters

Water meters in the system.

```sql
CREATE TYPE dma.meter_type AS ENUM ('bulk', 'zone', 'customer', 'check');
CREATE TYPE dma.meter_status AS ENUM ('active', 'inactive', 'faulty', 'replaced');

CREATE TABLE dma.meters (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    serial_no       VARCHAR(50) NOT NULL UNIQUE,
    dma_id          UUID NOT NULL REFERENCES dma.dmas(id),
    meter_type      dma.meter_type NOT NULL,
    brand           VARCHAR(100),
    model           VARCHAR(100),
    size_mm         INTEGER,
    install_date    DATE,
    last_calibration DATE,
    status          dma.meter_status DEFAULT 'active',
    location_desc   TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meters_dma ON dma.meters (dma_id);
CREATE INDEX idx_meters_serial ON dma.meters (serial_no);
```

## Schema: readings

### flow_readings

DMA flow rate readings (TimescaleDB hypertable).

```sql
CREATE TABLE readings.flow_readings (
    id              UUID DEFAULT gen_random_uuid(),
    dma_id          UUID NOT NULL REFERENCES dma.dmas(id),
    recorded_at     TIMESTAMPTZ NOT NULL,
    flow_rate       DECIMAL(12,4) NOT NULL,  -- m³/h
    total_flow      DECIMAL(15,4),           -- m³ cumulative
    quality         SMALLINT DEFAULT 100,    -- 0-100
    source          VARCHAR(20) DEFAULT 'scada',

    PRIMARY KEY (dma_id, recorded_at)
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('readings.flow_readings', 'recorded_at');

-- Compression policy (after 7 days)
ALTER TABLE readings.flow_readings SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'dma_id'
);
SELECT add_compression_policy('readings.flow_readings', INTERVAL '7 days');

CREATE INDEX idx_flow_dma_time ON readings.flow_readings (dma_id, recorded_at DESC);
```

### pressure_readings

DMA pressure readings.

```sql
CREATE TABLE readings.pressure_readings (
    id              UUID DEFAULT gen_random_uuid(),
    dma_id          UUID NOT NULL REFERENCES dma.dmas(id),
    recorded_at     TIMESTAMPTZ NOT NULL,
    pressure        DECIMAL(6,3) NOT NULL,   -- bar
    min_pressure    DECIMAL(6,3),
    max_pressure    DECIMAL(6,3),
    quality         SMALLINT DEFAULT 100,
    source          VARCHAR(20) DEFAULT 'scada',

    PRIMARY KEY (dma_id, recorded_at)
);

SELECT create_hypertable('readings.pressure_readings', 'recorded_at');
```

### meter_readings

Individual meter readings.

```sql
CREATE TABLE readings.meter_readings (
    id              UUID DEFAULT gen_random_uuid(),
    meter_id        UUID NOT NULL REFERENCES dma.meters(id),
    recorded_at     TIMESTAMPTZ NOT NULL,
    reading         DECIMAL(15,4) NOT NULL,  -- m³ cumulative
    consumption     DECIMAL(12,4),           -- m³ since last reading
    reading_type    VARCHAR(20) DEFAULT 'auto',
    status          VARCHAR(20) DEFAULT 'valid',

    PRIMARY KEY (meter_id, recorded_at)
);

SELECT create_hypertable('readings.meter_readings', 'recorded_at');
```

## Schema: analysis

### nrw_calculations

Non-Revenue Water calculations.

```sql
CREATE TABLE analysis.nrw_calculations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dma_id          UUID NOT NULL REFERENCES dma.dmas(id),
    period_start    DATE NOT NULL,
    period_end      DATE NOT NULL,
    system_input    DECIMAL(15,4) NOT NULL,  -- m³
    billed_auth     DECIMAL(15,4),           -- m³ billed authorized
    unbilled_auth   DECIMAL(15,4),           -- m³ unbilled authorized
    apparent_loss   DECIMAL(15,4),           -- m³
    real_loss       DECIMAL(15,4),           -- m³
    nrw_volume      DECIMAL(15,4) NOT NULL,  -- m³
    nrw_percent     DECIMAL(5,2) NOT NULL,   -- %
    ili             DECIMAL(8,4),            -- Infrastructure Leakage Index
    carl            DECIMAL(15,4),           -- Current Annual Real Losses
    uarl            DECIMAL(15,4),           -- Unavoidable Annual Real Losses
    calculated_at   TIMESTAMPTZ DEFAULT NOW(),
    calculated_by   UUID REFERENCES public.users(id),

    UNIQUE(dma_id, period_start, period_end)
);

CREATE INDEX idx_nrw_dma_period ON analysis.nrw_calculations (dma_id, period_start);
```

### ai_predictions

AI model predictions.

```sql
CREATE TYPE analysis.model_type AS ENUM (
    'leak_detection',
    'demand_forecast',
    'pressure_anomaly',
    'pipe_failure'
);

CREATE TABLE analysis.ai_predictions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dma_id          UUID NOT NULL REFERENCES dma.dmas(id),
    model_type      analysis.model_type NOT NULL,
    model_version   VARCHAR(50),
    predicted_at    TIMESTAMPTZ DEFAULT NOW(),
    prediction      JSONB NOT NULL,
    confidence      DECIMAL(5,4),            -- 0-1
    actual_value    JSONB,
    is_validated    BOOLEAN DEFAULT false,

    CONSTRAINT valid_confidence CHECK (confidence >= 0 AND confidence <= 1)
);

CREATE INDEX idx_predictions_dma ON analysis.ai_predictions (dma_id);
CREATE INDEX idx_predictions_model ON analysis.ai_predictions (model_type);
```

## Schema: alerts

### alerts

System alerts and notifications.

```sql
CREATE TYPE alerts.alert_type AS ENUM (
    'high_nrw',
    'leak_detected',
    'pressure_anomaly',
    'meter_fault',
    'threshold_breach',
    'system_error'
);

CREATE TYPE alerts.severity AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE alerts.alerts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dma_id          UUID REFERENCES dma.dmas(id),
    alert_type      alerts.alert_type NOT NULL,
    severity        alerts.severity NOT NULL,
    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,
    details         JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID REFERENCES public.users(id),
    resolved_at     TIMESTAMPTZ,
    resolved_by     UUID REFERENCES public.users(id),
    resolution_note TEXT
);

CREATE INDEX idx_alerts_dma ON alerts.alerts (dma_id);
CREATE INDEX idx_alerts_type ON alerts.alerts (alert_type);
CREATE INDEX idx_alerts_severity ON alerts.alerts (severity);
CREATE INDEX idx_alerts_unresolved ON alerts.alerts (created_at)
    WHERE resolved_at IS NULL;
```

## Schema: spatial

### dma_boundaries

DMA geographic boundaries.

```sql
CREATE TABLE spatial.dma_boundaries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dma_id          UUID NOT NULL UNIQUE REFERENCES dma.dmas(id) ON DELETE CASCADE,
    geom            GEOMETRY(MULTIPOLYGON, 4326) NOT NULL,
    area_m2         DECIMAL(15,2),
    perimeter_m     DECIMAL(12,2),
    centroid        GEOMETRY(POINT, 4326),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dma_boundaries_geom ON spatial.dma_boundaries USING GIST (geom);
CREATE INDEX idx_dma_boundaries_dma ON spatial.dma_boundaries (dma_id);
```

### pipe_network

Water pipe network.

```sql
CREATE TYPE spatial.pipe_material AS ENUM (
    'pvc', 'pe', 'hdpe', 'cast_iron', 'ductile_iron', 'steel', 'ac', 'other'
);

CREATE TABLE spatial.pipe_network (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dma_id          UUID NOT NULL REFERENCES dma.dmas(id),
    geom            GEOMETRY(LINESTRING, 4326) NOT NULL,
    length_m        DECIMAL(10,2),
    diameter_mm     INTEGER,
    material        spatial.pipe_material,
    install_year    INTEGER,
    condition       SMALLINT,  -- 1-5 scale
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pipe_network_geom ON spatial.pipe_network USING GIST (geom);
CREATE INDEX idx_pipe_network_dma ON spatial.pipe_network (dma_id);
```

## Related Documents

- [Database Overview](./overview.md)
- [ERD](./erd.md)
- [Migrations](./migrations.md)
