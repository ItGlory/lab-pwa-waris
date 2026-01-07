"""Initial schema

Revision ID: 001
Revises:
Create Date: 2026-01-07

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create regions table
    op.create_table(
        'regions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('code', sa.String(20), unique=True, nullable=False),
        sa.Column('name_th', sa.String(255), nullable=False),
        sa.Column('name_en', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )

    # Create branches table
    op.create_table(
        'branches',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('code', sa.String(20), unique=True, nullable=False),
        sa.Column('name_th', sa.String(255), nullable=False),
        sa.Column('name_en', sa.String(255), nullable=False),
        sa.Column('region_id', sa.String(36), sa.ForeignKey('regions.id'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('name_th', sa.String(255), nullable=False),
        sa.Column('role', sa.String(50), nullable=False, default='viewer'),
        sa.Column('branch_id', sa.String(36), sa.ForeignKey('branches.id'), nullable=True),
        sa.Column('region_id', sa.String(36), sa.ForeignKey('regions.id'), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )

    # Create DMA status enum
    dma_status = sa.Enum('normal', 'warning', 'critical', name='dma_status')
    dma_status.create(op.get_bind())

    # Create DMAs table
    op.create_table(
        'dmas',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('code', sa.String(20), unique=True, nullable=False, index=True),
        sa.Column('name_th', sa.String(255), nullable=False),
        sa.Column('name_en', sa.String(255), nullable=False),
        sa.Column('branch_id', sa.String(36), sa.ForeignKey('branches.id'), nullable=False),
        sa.Column('region_id', sa.String(36), sa.ForeignKey('regions.id'), nullable=False),
        sa.Column('area_km2', sa.Float(), nullable=False, default=0),
        sa.Column('population', sa.Integer(), nullable=False, default=0),
        sa.Column('connections', sa.Integer(), nullable=False, default=0),
        sa.Column('pipe_length_km', sa.Float(), nullable=False, default=0),
        sa.Column('current_inflow', sa.Float(), nullable=False, default=0),
        sa.Column('current_outflow', sa.Float(), nullable=False, default=0),
        sa.Column('current_loss', sa.Float(), nullable=False, default=0),
        sa.Column('loss_percentage', sa.Float(), nullable=False, default=0),
        sa.Column('avg_pressure', sa.Float(), nullable=False, default=0),
        sa.Column('status', dma_status, nullable=False, default='normal'),
        sa.Column('last_reading_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )

    # Create DMA readings table
    op.create_table(
        'dma_readings',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('dma_id', sa.String(36), sa.ForeignKey('dmas.id'), nullable=False, index=True),
        sa.Column('reading_date', sa.DateTime(timezone=True), nullable=False, index=True),
        sa.Column('inflow', sa.Float(), nullable=False),
        sa.Column('outflow', sa.Float(), nullable=False),
        sa.Column('loss', sa.Float(), nullable=False),
        sa.Column('loss_percentage', sa.Float(), nullable=False),
        sa.Column('pressure', sa.Float(), nullable=False),
    )

    # Create alert enums
    alert_type = sa.Enum('high_loss', 'threshold_breach', 'pressure_anomaly', 'flow_anomaly',
                         'leak_detected', 'meter_fault', 'system_error', name='alert_type')
    alert_type.create(op.get_bind())

    alert_severity = sa.Enum('low', 'medium', 'high', 'critical', name='alert_severity')
    alert_severity.create(op.get_bind())

    alert_status = sa.Enum('active', 'acknowledged', 'resolved', name='alert_status')
    alert_status.create(op.get_bind())

    # Create alerts table
    op.create_table(
        'alerts',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('dma_id', sa.String(36), sa.ForeignKey('dmas.id'), nullable=False, index=True),
        sa.Column('type', alert_type, nullable=False),
        sa.Column('severity', alert_severity, nullable=False),
        sa.Column('status', alert_status, nullable=False, default='active', index=True),
        sa.Column('title_th', sa.String(255), nullable=False),
        sa.Column('title_en', sa.String(255), nullable=False),
        sa.Column('description_th', sa.Text(), nullable=True),
        sa.Column('description_en', sa.Text(), nullable=True),
        sa.Column('triggered_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('acknowledged_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('acknowledged_by', sa.String(36), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('resolved_by', sa.String(36), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('alerts')
    op.drop_table('dma_readings')
    op.drop_table('dmas')
    op.drop_table('users')
    op.drop_table('branches')
    op.drop_table('regions')

    # Drop enums
    sa.Enum(name='alert_status').drop(op.get_bind())
    sa.Enum(name='alert_severity').drop(op.get_bind())
    sa.Enum(name='alert_type').drop(op.get_bind())
    sa.Enum(name='dma_status').drop(op.get_bind())
