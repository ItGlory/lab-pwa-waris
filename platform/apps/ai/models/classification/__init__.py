"""
Classification Models for Water Loss
TOR Reference: Section 4.5.1

Models:
1. Baseline: Decision Tree
2. Approach 1: XGBoost
3. Approach 2: Random Forest

Purpose: แยกแยะประเภทน้ำสูญเสีย (Physical vs Commercial)
"""

from .classifier import WaterLossClassifier
from .tree_models import DecisionTreeClassifier, RandomForestClassifier, XGBoostClassifier

__all__ = [
    "WaterLossClassifier",
    "DecisionTreeClassifier",
    "RandomForestClassifier",
    "XGBoostClassifier",
]
