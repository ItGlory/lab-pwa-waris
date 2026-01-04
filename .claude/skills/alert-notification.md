# /alert-notification

Manage water loss alerts and notification system.

## Description
Configure and manage the intelligent alerting system for water loss events and anomalies.

## Usage
```
/alert-notification [action] [alert_type]
```

## Parameters
- `action`: Action (create | list | acknowledge | configure | history)
- `alert_type`: Type of alert (critical | warning | info | all)

## Alert Categories

### Critical Alerts (แจ้งเตือนวิกฤต)
- Major pipe burst detected
- System-wide pressure drop
- Unusual high water loss (>threshold)
- Equipment failure

### Warning Alerts (แจ้งเตือนเฝ้าระวัง)
- Elevated water loss trend
- Meter malfunction suspected
- Unusual consumption pattern
- Maintenance due

### Information Alerts (แจ้งข้อมูล)
- Daily summary available
- Report generated
- Model updated
- System status update

## Notification Channels

### Web Application
- In-app notifications
- Dashboard widgets
- Real-time updates via WebSocket

### PWA Integration (แพลตฟอร์ม กปภ.)
- Push notifications
- Email integration
- SMS alerts (critical only)
- LINE Official Account

## Alert Configuration

### Thresholds
- Water loss percentage threshold per DMA
- Flow rate deviation limits
- Pressure drop thresholds
- Response time SLAs

### Escalation Rules
- Auto-escalate after X hours
- Multi-level approval workflow
- On-call rotation support

### Notification Preferences
- Per-user preferences
- Role-based routing
- Time-based rules (working hours)
- Quiet hours configuration

## Alert History
- 60-day retention minimum
- Full audit trail
- Timestamp logging
- Action tracking
