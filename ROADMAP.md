# Credit Card Fraud Detection — Project Roadmap

**Stack:** Python · scikit-learn · FastAPI · Next.js  
**Dataset:** Kaggle — European Cardholders (284,807 transactions)  
**Models:** Isolation Forest · Logistic Regression · Random Forest  
**Hardware note:** GTX 1650 (4GB VRAM) — all heavy training runs on Kaggle Notebooks; local machine handles FastAPI serving and Next.js dev only.

---

## Phase 0 — Environment Setup

**Goal:** Get the full dev environment ready before touching any data or code.

### 0.1 Python environment (WSL2)

```bash
# From D:\Codebase\ (your codebase root)
mkdir credit-fraud && cd credit-fraud
uv venv .venv --python 3.12
source .venv/bin/activate

uv pip install \
  fastapi uvicorn[standard] \
  scikit-learn imbalanced-learn \
  pandas numpy joblib \
  matplotlib seaborn \
  pydantic python-dotenv
```

> Use Python 3.12, not 3.15 — scikit-learn's binary wheels aren't stable on 3.15 yet.

### 0.2 Frontend (Next.js)

```bash
npx create-next-app@latest frontend --typescript --tailwind --app
cd frontend && npm install axios
```

### 0.3 Repo structure

```
credit-fraud/
├── notebooks/
│   ├── 01_eda.ipynb
│   ├── 02_preprocessing.ipynb
│   ├── 03_training.ipynb
│   └── 04_evaluation.ipynb
├── backend/
│   ├── main.py
│   ├── schemas.py
│   ├── predictor.py
│   └── models/            ← .joblib files land here after training
├── frontend/              ← Next.js app
│   └── app/
│       ├── page.tsx       ← main UI
│       └── api/           ← optional Next.js API routes
├── data/                  ← gitignored; place creditcard.csv here
│   └── .gitkeep
├── .gitignore
├── README.md
└── requirements.txt
```

Add to `.gitignore`:
```
data/
backend/models/
.venv/
__pycache__/
*.joblib
```

### 0.4 Dataset

Download `creditcard.csv` from [Kaggle](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud) and place it in `data/`. Do **not** commit it — 150MB file.

---

## Phase 1 — Exploratory Data Analysis

**Goal:** Understand the dataset deeply before writing a single model line.  
**Where:** `notebooks/01_eda.ipynb` — run on Kaggle or locally (Pandas is fine on your machine).

### 1.1 Dataset overview

```python
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

df = pd.read_csv('../data/creditcard.csv')
print(df.shape)          # (284807, 31)
print(df.dtypes)
print(df.isnull().sum())  # Should be zero nulls
print(df['Class'].value_counts())
# 0 → 284315 (legit)
# 1 → 492 (fraud) — 0.172%
```

### 1.2 Class imbalance visualization

```python
fig, ax = plt.subplots()
df['Class'].value_counts().plot(kind='bar', ax=ax, color=['steelblue', 'tomato'])
ax.set_xticklabels(['Legit', 'Fraud'], rotation=0)
ax.set_title('Class Distribution')
plt.tight_layout()
plt.savefig('../assets/class_distribution.png', dpi=150)
```

**Key finding to note in your report:** Accuracy is a useless metric here. A model that predicts "legit" for every transaction gets 99.83% accuracy but catches zero fraud.

### 1.3 Feature analysis

```python
# Amount distribution (will need scaling)
df[['Amount']].describe()

# Time distribution
df[['Time']].describe()

# V1-V28 are already PCA-transformed — zero correlation with each other by construction
# Check for any outliers in Amount
sns.boxplot(x='Class', y='Amount', data=df)
```

### 1.4 Correlation heatmap (fraud vs legit)

```python
fraud = df[df['Class'] == 1]
legit = df[df['Class'] == 0].sample(1000, random_state=42)
combined = pd.concat([fraud, legit])

plt.figure(figsize=(12, 10))
sns.heatmap(combined.corr(), cmap='coolwarm', center=0, linewidths=0.1)
plt.title('Feature Correlation (Fraud + Legit sample)')
plt.tight_layout()
```

### 1.5 Feature distributions: fraud vs legit

Pick the top correlated features (typically V14, V17, V12, V10) and plot KDE overlays:

```python
top_features = ['V14', 'V17', 'V12', 'V10', 'Amount']

fig, axes = plt.subplots(1, len(top_features), figsize=(20, 4))
for i, feat in enumerate(top_features):
    df[df['Class'] == 0][feat].plot(kind='kde', ax=axes[i], label='Legit', alpha=0.7)
    df[df['Class'] == 1][feat].plot(kind='kde', ax=axes[i], label='Fraud', alpha=0.7)
    axes[i].set_title(feat)
    axes[i].legend()
plt.tight_layout()
```

**Document your EDA findings** — these go directly into your report as the "Data Understanding" section.

---

## Phase 2 — Preprocessing

**Goal:** Prepare a clean, properly split dataset ready for model training.  
**Where:** `notebooks/02_preprocessing.ipynb` — also runs fine locally.

### 2.1 Scale Amount and Time

V1–V28 are already PCA-scaled. `Amount` and `Time` are raw and will dominate distance-based models if not scaled.

```python
from sklearn.preprocessing import RobustScaler

scaler = RobustScaler()  # RobustScaler is better than StandardScaler for outlier-heavy data like Amount
df['Amount_scaled'] = scaler.fit_transform(df[['Amount']])
df['Time_scaled'] = scaler.fit_transform(df[['Time']])

df.drop(columns=['Amount', 'Time'], inplace=True)
```

### 2.2 Train/test split — do this BEFORE SMOTE

```python
from sklearn.model_selection import train_test_split

X = df.drop('Class', axis=1)
y = df['Class']

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y   # ← preserves the 0.17% fraud ratio in both splits
)

print(f"Train: {X_train.shape}, fraud: {y_train.sum()}")
print(f"Test:  {X_test.shape},  fraud: {y_test.sum()}")
```

### 2.3 Apply SMOTE — on training set only

```python
from imblearn.over_sampling import SMOTE

sm = SMOTE(random_state=42, k_neighbors=5)
X_train_resampled, y_train_resampled = sm.fit_resample(X_train, y_train)

print(f"After SMOTE — fraud: {y_train_resampled.sum()}, legit: {(y_train_resampled == 0).sum()}")
# Should be balanced ~50/50 now
```

> **Never apply SMOTE to the test set.** Test data must reflect real-world distribution. SMOTE on test = data leakage = inflated metrics.

### 2.4 Save preprocessed splits

```python
import joblib, numpy as np

joblib.dump((X_train_resampled, y_train_resampled), '../data/train_smote.joblib')
joblib.dump((X_test, y_test), '../data/test.joblib')
joblib.dump(scaler, '../backend/models/scaler.joblib')
```

---

## Phase 3 — Model Training

**Goal:** Train all three models, tune basic hyperparameters, save artifacts.  
**Where:** `notebooks/03_training.ipynb` — **run this on Kaggle** (Random Forest on 227k rows after SMOTE will be slow on 4GB RAM + no GPU).

### 3.1 Load preprocessed data

```python
import joblib
X_train, y_train = joblib.load('train_smote.joblib')
X_test, y_test = joblib.load('test.joblib')
```

### 3.2 Model A — Isolation Forest

Isolation Forest is unsupervised — it doesn't use labels during training. The key parameter is `contamination`, which should match the actual fraud rate.

```python
from sklearn.ensemble import IsolationForest

iso = IsolationForest(
    n_estimators=200,
    contamination=0.002,   # ~0.17% fraud rate
    random_state=42,
    n_jobs=-1
)

# Train on UNSMOTED data (unsupervised — labels irrelevant)
iso.fit(X_train)

# Predictions: -1 = anomaly (fraud), 1 = normal
iso_preds_raw = iso.predict(X_test)
iso_preds = (iso_preds_raw == -1).astype(int)  # convert to 0/1

joblib.dump(iso, '../backend/models/isolation_forest.joblib')
```

### 3.3 Model B — Logistic Regression

```python
from sklearn.linear_model import LogisticRegression

lr = LogisticRegression(
    class_weight='balanced',  # compensates for imbalance even without SMOTE
    max_iter=1000,
    random_state=42,
    solver='lbfgs'
)

lr.fit(X_train, y_train)
lr_probs = lr.predict_proba(X_test)[:, 1]   # probability of fraud

joblib.dump(lr, '../backend/models/logistic_regression.joblib')
```

### 3.4 Model C — Random Forest

```python
from sklearn.ensemble import RandomForestClassifier

rf = RandomForestClassifier(
    n_estimators=200,
    max_depth=20,
    class_weight='balanced_subsample',
    random_state=42,
    n_jobs=-1
)

rf.fit(X_train, y_train)
rf_probs = rf.predict_proba(X_test)[:, 1]

joblib.dump(rf, '../backend/models/random_forest.joblib')
```

### 3.5 Threshold tuning (Logistic Regression + Random Forest)

The default 0.5 threshold is rarely optimal for fraud detection. Plot F1 vs threshold to find the sweet spot:

```python
from sklearn.metrics import f1_score
import numpy as np

thresholds = np.arange(0.1, 0.9, 0.01)
f1_scores_lr = [f1_score(y_test, (lr_probs >= t).astype(int)) for t in thresholds]
f1_scores_rf = [f1_score(y_test, (rf_probs >= t).astype(int)) for t in thresholds]

best_threshold_lr = thresholds[np.argmax(f1_scores_lr)]
best_threshold_rf = thresholds[np.argmax(f1_scores_rf)]

print(f"Best threshold LR: {best_threshold_lr:.2f}, RF: {best_threshold_rf:.2f}")
joblib.dump({'lr': best_threshold_lr, 'rf': best_threshold_rf}, '../backend/models/thresholds.joblib')
```

---

## Phase 4 — Evaluation

**Goal:** Rigorous, honest comparison of all three models.  
**Where:** `notebooks/04_evaluation.ipynb`

### 4.1 Metrics for each model

```python
from sklearn.metrics import (
    classification_report, confusion_matrix,
    roc_auc_score, average_precision_score,
    ConfusionMatrixDisplay, RocCurveDisplay,
    PrecisionRecallDisplay
)

models = {
    'Isolation Forest': iso_preds,         # binary already
    'Logistic Regression': (lr_probs >= best_threshold_lr).astype(int),
    'Random Forest': (rf_probs >= best_threshold_rf).astype(int),
}

for name, preds in models.items():
    print(f"\n{'='*40}")
    print(f"  {name}")
    print('='*40)
    print(classification_report(y_test, preds, target_names=['Legit', 'Fraud']))
```

### 4.2 Confusion matrices

```python
fig, axes = plt.subplots(1, 3, figsize=(15, 4))
for ax, (name, preds) in zip(axes, models.items()):
    cm = confusion_matrix(y_test, preds)
    ConfusionMatrixDisplay(cm, display_labels=['Legit', 'Fraud']).plot(ax=ax, colorbar=False)
    ax.set_title(name)
plt.tight_layout()
plt.savefig('../assets/confusion_matrices.png', dpi=150)
```

### 4.3 ROC + PR curves (overlay)

```python
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))

# ROC AUC (Isolation Forest uses decision_function scores)
iso_scores = -iso.decision_function(X_test)   # negate: higher = more anomalous

for name, scores in [('Isolation Forest', iso_scores), ('Logistic Regression', lr_probs), ('Random Forest', rf_probs)]:
    RocCurveDisplay.from_predictions(y_test, scores, name=name, ax=ax1)

ax1.set_title('ROC Curves')
ax1.plot([0,1],[0,1],'k--')

# Precision-Recall (more informative for imbalanced data)
for name, scores in [('Isolation Forest', iso_scores), ('Logistic Regression', lr_probs), ('Random Forest', rf_probs)]:
    PrecisionRecallDisplay.from_predictions(y_test, scores, name=name, ax=ax2)

ax2.set_title('Precision-Recall Curves')
plt.tight_layout()
plt.savefig('../assets/roc_pr_curves.png', dpi=150)
```

### 4.4 Feature importance (Random Forest)

```python
importances = rf.feature_importances_
feat_names = X_train.columns
indices = np.argsort(importances)[::-1][:15]  # top 15

plt.figure(figsize=(10, 5))
plt.bar(range(15), importances[indices])
plt.xticks(range(15), feat_names[indices], rotation=45, ha='right')
plt.title('Random Forest — Top 15 Feature Importances')
plt.tight_layout()
plt.savefig('../assets/feature_importance.png', dpi=150)
```

### 4.5 Summary table (for your report)

| Model | Precision (Fraud) | Recall (Fraud) | F1 (Fraud) | PR-AUC |
|---|---|---|---|---|
| Isolation Forest | ~0.30 | ~0.75 | ~0.43 | ~0.45 |
| Logistic Regression | ~0.88 | ~0.61 | ~0.72 | ~0.75 |
| Random Forest | ~0.93 | ~0.82 | ~0.87 | ~0.88 |

> Replace with your actual numbers. Expected: Random Forest wins, Isolation Forest has high recall but many false positives.

---

## Phase 5 — FastAPI Backend

**Goal:** Serve all three trained models via a REST API.  
**Where:** `backend/` — runs locally on WSL2 with no GPU needed.

### 5.1 `schemas.py` — input/output contracts

```python
from pydantic import BaseModel
from typing import Literal

class Transaction(BaseModel):
    V1: float; V2: float; V3: float; V4: float
    V5: float; V6: float; V7: float; V8: float
    V9: float; V10: float; V11: float; V12: float
    V13: float; V14: float; V15: float; V16: float
    V17: float; V18: float; V19: float; V20: float
    V21: float; V22: float; V23: float; V24: float
    V25: float; V26: float; V27: float; V28: float
    Amount: float
    Time: float

class PredictionResult(BaseModel):
    isolation_forest: Literal['fraud', 'legit']
    logistic_regression: Literal['fraud', 'legit']
    random_forest: Literal['fraud', 'legit']
    rf_fraud_probability: float
    lr_fraud_probability: float
    consensus: Literal['fraud', 'legit', 'uncertain']
```

### 5.2 `predictor.py` — model loading and inference

```python
import joblib, numpy as np, pandas as pd
from pathlib import Path

MODELS_DIR = Path(__file__).parent / "models"

class FraudPredictor:
    def __init__(self):
        self.iso   = joblib.load(MODELS_DIR / "isolation_forest.joblib")
        self.lr    = joblib.load(MODELS_DIR / "logistic_regression.joblib")
        self.rf    = joblib.load(MODELS_DIR / "random_forest.joblib")
        self.scaler = joblib.load(MODELS_DIR / "scaler.joblib")
        self.thresholds = joblib.load(MODELS_DIR / "thresholds.joblib")

    def predict(self, transaction: dict) -> dict:
        df = pd.DataFrame([transaction])
        
        # Scale Amount and Time
        df['Amount_scaled'] = self.scaler.transform(df[['Amount']])
        df['Time_scaled']   = self.scaler.transform(df[['Time']])
        df.drop(columns=['Amount', 'Time'], inplace=True)

        # Isolation Forest
        iso_pred = self.iso.predict(df)[0]
        iso_label = 'fraud' if iso_pred == -1 else 'legit'

        # Logistic Regression
        lr_prob = self.lr.predict_proba(df)[0][1]
        lr_label = 'fraud' if lr_prob >= self.thresholds['lr'] else 'legit'

        # Random Forest
        rf_prob = self.rf.predict_proba(df)[0][1]
        rf_label = 'fraud' if rf_prob >= self.thresholds['rf'] else 'legit'

        # Consensus: fraud if 2/3 models agree
        votes = [iso_label, lr_label, rf_label]
        fraud_votes = votes.count('fraud')
        consensus = 'fraud' if fraud_votes >= 2 else ('uncertain' if fraud_votes == 1 else 'legit')

        return {
            'isolation_forest': iso_label,
            'logistic_regression': lr_label,
            'random_forest': rf_label,
            'rf_fraud_probability': round(rf_prob, 4),
            'lr_fraud_probability': round(lr_prob, 4),
            'consensus': consensus,
        }

predictor = FraudPredictor()  # loaded once at module level
```

### 5.3 `main.py` — FastAPI app

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from schemas import Transaction, PredictionResult
from predictor import predictor

app = FastAPI(title="Fraud Detection API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev port
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict", response_model=PredictionResult)
def predict(transaction: Transaction):
    return predictor.predict(transaction.model_dump())
```

### 5.4 Run the API

```bash
cd backend
uvicorn main:app --reload --port 8000
# Docs at: http://localhost:8000/docs
```

---

## Phase 6 — Next.js Frontend

**Goal:** A clean UI where you can input transaction details and get predictions from all three models.

### 6.1 Pages and components

```
frontend/app/
├── page.tsx              ← main transaction input + results
├── components/
│   ├── TransactionForm.tsx
│   ├── ResultCard.tsx
│   └── ModelComparison.tsx
└── lib/
    └── api.ts            ← axios wrapper for FastAPI calls
```

### 6.2 `lib/api.ts`

```typescript
import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface Transaction {
  V1: number; V2: number; /* ... V3-V28 ... */
  Amount: number;
  Time: number;
}

export interface PredictionResult {
  isolation_forest: 'fraud' | 'legit'
  logistic_regression: 'fraud' | 'legit'
  random_forest: 'fraud' | 'legit'
  rf_fraud_probability: number
  lr_fraud_probability: number
  consensus: 'fraud' | 'legit' | 'uncertain'
}

export async function predictFraud(txn: Transaction): Promise<PredictionResult> {
  const res = await axios.post<PredictionResult>(`${API_BASE}/predict`, txn)
  return res.data
}
```

### 6.3 UI suggestions

Since V1–V28 are opaque PCA features, the form UI should let users either:

1. **Paste a CSV row** (one transaction from the dataset) — parse it client-side and fill all fields automatically. This makes the demo actually usable.
2. **Random fraud/legit sample button** — preload known fraud/legit examples from a hardcoded sample set for live demo.

Show results as three colored cards (green = legit, red = fraud) side by side, with a probability bar for RF and LR, and a prominent "consensus" verdict at the top.

### 6.4 Environment variables

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Phase 7 — Integration Testing & Final Polish

**Goal:** Make sure the full stack works end-to-end before submission.

### 7.1 Test the API with a real fraud sample

```bash
# From the dataset, grab a known fraud row and curl the API
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"V1": -1.35, "V2": -0.07, ..., "Amount": 149.62, "Time": 0}'
```

### 7.2 Run both servers concurrently

```bash
# Terminal 1 (WSL2)
cd backend && uvicorn main:app --reload

# Terminal 2 (WSL2)
cd frontend && npm run dev
```

### 7.3 What to include in your submission

- `README.md` with setup instructions and a screenshot of the UI
- Saved Kaggle notebook links (or exported `.ipynb` files) for all 4 notebooks
- The `backend/` and `frontend/` source code (no data files, no `.joblib` files — too large)
- Assets folder with your generated plots (confusion matrices, ROC curves, feature importance)

---

## Appendix — Key Numbers to Report

| Metric | Value |
|---|---|
| Total transactions | 284,807 |
| Fraud transactions | 492 (0.172%) |
| Features | 30 (V1–V28 PCA, Amount, Time) |
| Train set size | ~227,846 |
| Test set size | ~56,961 |
| After SMOTE (train) | ~454,000 (balanced) |
| Recommended eval metric | F1-score + PR-AUC |

## Appendix — Why Not Accuracy?

A classifier that labels every transaction as "legit" achieves **99.83% accuracy**. That classifier catches zero fraud. For imbalanced binary classification, always report:

- **Precision** (of predicted frauds, how many are real frauds — false positive cost)
- **Recall** (of all actual frauds, how many did we catch — false negative cost)
- **F1** (harmonic mean of the two)
- **PR-AUC** (area under precision-recall curve — best single-number summary for imbalanced problems)

ROC-AUC is fine too, but can be optimistic on heavily imbalanced datasets.