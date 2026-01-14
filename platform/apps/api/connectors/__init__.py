"""
Data Connectors for DMAMA Integration
TOR Reference: Section 4.3
"""

from .base import DataConnector
from .dmama import DMAMAAPIConnector, DMAMADBConnector, DMAMAFileConnector

__all__ = [
    "DataConnector",
    "DMAMAAPIConnector",
    "DMAMADBConnector",
    "DMAMAFileConnector",
]
