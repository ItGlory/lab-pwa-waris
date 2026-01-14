"""
Pattern Recognition Models
TOR Reference: Section 4.5.1

Models:
1. Baseline: Rule-based patterns
2. Approach 1: K-Means + DBSCAN (Clustering)
3. Approach 2: CNN (Convolutional Neural Network)

Purpose: จดจำรูปแบบการใช้น้ำ, ฤดูกาล, กลุ่มผู้ใช้
"""

from .recognizer import PatternRecognizer
from .clustering import KMeansRecognizer, DBSCANRecognizer

__all__ = [
    "PatternRecognizer",
    "KMeansRecognizer",
    "DBSCANRecognizer",
]
