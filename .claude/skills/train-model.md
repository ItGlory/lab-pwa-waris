# /train-model

Train or fine-tune AI models for water loss analysis.

## Description
Manage ML model training, validation, and deployment for the WARIS AI system.

## Usage
```
/train-model [model_type] [action]
```

## Parameters
- `model_type`: Type of model (anomaly | pattern | classification | timeseries | llm)
- `action`: Action to perform (train | evaluate | deploy | rollback)

## Model Types

### Anomaly Detection Model
- Algorithm: Isolation Forest, LSTM Autoencoder
- Input: Flow rate, pressure, timestamp
- Output: Anomaly score, anomaly type

### Pattern Recognition Model
- Algorithm: K-Means, DBSCAN, CNN
- Input: Historical consumption data
- Output: Usage patterns, cluster assignments

### Classification Model
- Algorithm: XGBoost, Random Forest, Neural Network
- Input: Leak characteristics, location data
- Output: Physical/Commercial loss classification

### Time-series Prediction Model
- Algorithm: Prophet, LSTM, Transformer
- Input: Historical water loss data
- Output: Future trend predictions

### LLM Fine-tuning
- Base Model: 70B+ parameter model (Thai-capable)
- Fine-tuning: Domain-specific water management terminology
- Output: Improved Thai language understanding for Q&A

## Instructions

1. **Data Preparation**
   - Load labeled data from Data Lake
   - Perform data profiling and cleaning
   - Split into train/validation/test sets

2. **Model Training**
   - Configure hyperparameters
   - Train on GPU cluster (On-premise or G-Cloud)
   - Log metrics to MLflow

3. **Evaluation**
   - Calculate Precision, Recall, F1-score
   - Compare with baseline model
   - Generate evaluation report

4. **Deployment**
   - Package model with ONNX/TorchScript
   - Deploy to inference server
   - Update API endpoints

## Performance Metrics
- Anomaly Detection: Precision, Recall, F1
- Classification: Accuracy, AUC-ROC
- Time-series: MAE, RMSE, MAPE
- LLM: BLEU, ROUGE, Human evaluation
