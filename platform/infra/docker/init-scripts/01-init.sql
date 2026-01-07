-- WARIS Database Initialization Script
-- Creates initial schema and seed data

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dma_status') THEN
        CREATE TYPE dma_status AS ENUM ('normal', 'warning', 'critical');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_type') THEN
        CREATE TYPE alert_type AS ENUM ('high_loss', 'threshold_breach', 'pressure_anomaly', 'flow_anomaly', 'leak_detected', 'meter_fault', 'system_error');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_severity') THEN
        CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'alert_status') THEN
        CREATE TYPE alert_status AS ENUM ('active', 'acknowledged', 'resolved');
    END IF;
END$$;

-- Seed Regions
INSERT INTO regions (id, code, name_th, name_en, created_at) VALUES
    ('reg-001', 'REG-01', 'เขต 1 (ภาคเหนือ)', 'Region 1 (Northern)', NOW()),
    ('reg-002', 'REG-02', 'เขต 2 (ภาคกลาง)', 'Region 2 (Central)', NOW()),
    ('reg-003', 'REG-03', 'เขต 3 (ภาคตะวันออก)', 'Region 3 (Eastern)', NOW()),
    ('reg-004', 'REG-04', 'เขต 4 (ภาคตะวันออกเฉียงเหนือ)', 'Region 4 (Northeastern)', NOW()),
    ('reg-005', 'REG-05', 'เขต 5 (ภาคใต้)', 'Region 5 (Southern)', NOW())
ON CONFLICT (code) DO NOTHING;

-- Seed Branches
INSERT INTO branches (id, code, name_th, name_en, region_id, created_at) VALUES
    ('brn-001', 'BRN-001', 'สาขาเชียงใหม่', 'Chiang Mai Branch', 'reg-001', NOW()),
    ('brn-010', 'BRN-010', 'สาขาสมุทรปราการ', 'Samut Prakan Branch', 'reg-002', NOW()),
    ('brn-015', 'BRN-015', 'สาขาชลบุรี', 'Chonburi Branch', 'reg-003', NOW()),
    ('brn-020', 'BRN-020', 'สาขาขอนแก่น', 'Khon Kaen Branch', 'reg-004', NOW()),
    ('brn-035', 'BRN-035', 'สาขาภูเก็ต', 'Phuket Branch', 'reg-005', NOW())
ON CONFLICT (code) DO NOTHING;

-- Seed Users (password: admin123 for all)
-- Password hash for 'admin123': $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G9LB7aVYcI/tJi
INSERT INTO users (id, email, password_hash, name, name_th, role, region_id, branch_id, is_active, created_at) VALUES
    ('user-001', 'admin@pwa.co.th', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G9LB7aVYcI/tJi', 'System Administrator', 'ผู้ดูแลระบบ', 'admin', NULL, NULL, true, NOW()),
    ('user-002', 'manager@pwa.co.th', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G9LB7aVYcI/tJi', 'Regional Manager', 'ผู้จัดการเขต', 'manager', 'reg-002', NULL, true, NOW()),
    ('user-003', 'operator@pwa.co.th', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G9LB7aVYcI/tJi', 'Branch Operator', 'เจ้าหน้าที่สาขา', 'operator', 'reg-002', 'brn-010', true, NOW())
ON CONFLICT (email) DO NOTHING;

SELECT 'WARIS Database initialized successfully!' AS status;
