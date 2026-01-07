"""
User Model
"""

from typing import Optional

from sqlalchemy import String, Boolean, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    """User model for authentication"""
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    name_th: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="viewer")
    branch_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("branches.id"), nullable=True)
    region_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("regions.id"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    branch = relationship("Branch", back_populates="users")
    region = relationship("Region", back_populates="users")

    def __repr__(self) -> str:
        return f"<User {self.email}>"
