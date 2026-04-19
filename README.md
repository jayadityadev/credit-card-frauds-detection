# Credit Card Fraud Detection (Full Stack)

A full-stack fraud detection project using the Kaggle European cardholders dataset.

- Backend: FastAPI + scikit-learn
- Frontend: Next.js (App Router, TypeScript)
- Models: Isolation Forest (anomaly score), Logistic Regression, Random Forest

## Project Status

- Phase 0: Environment setup complete
- Phase 1: EDA complete
- Phase 2: Preprocessing complete
- Phase 3: Model training complete
- Phase 4: Evaluation complete
- Phase 5: FastAPI backend complete
- Phase 6: Next.js frontend complete
- Phase 7: Integration and polish complete

## Repository Structure

- `notebooks/`: EDA, preprocessing, training, evaluation notebooks
- `backend/`: FastAPI app (`main.py`, `schemas.py`, `predictor.py`, `models/`)
- `frontend/`: Next.js app
- `assets/`: saved visualizations
- `data/`: dataset and preprocessed artifacts (local)

## Run Locally

### 1) Backend

```bash
cd backend
source ../.venv/bin/activate
uvicorn main:app --reload --port 8000
```

API docs: `http://localhost:8000/docs`

### 2) Frontend

```bash
cd frontend
npm run dev
```

Frontend: `http://localhost:3000`

## API Contract

### POST `/predict`

Input JSON:
- `V1..V28`: float
- `Amount`: float
- `Time`: float

Output JSON:
- `isolation_forest_anomaly_score`: float
- `logistic_regression`: `fraud | legit`
- `random_forest`: `fraud | legit`
- `rf_fraud_probability`: float
- `lr_fraud_probability`: float
- `consensus`: `fraud | legit`

## Final Decision Policy

- Isolation Forest is used as anomaly score signal only.
- Final `consensus` is deterministic using LR and RF:
  - If LR and RF agree, use that label.
  - If they disagree, pick the model with stronger normalized confidence margin from its tuned threshold.

## Evaluation Snapshot

Test set: 56,962 rows (98 fraud)

- Isolation Forest: Precision 0.24, Recall 0.31, F1 0.27, PR-AUC 0.15, ROC-AUC 0.95
- Logistic Regression: Precision 0.19, Recall 0.89, F1 0.31, PR-AUC 0.72, ROC-AUC 0.97
- Random Forest: Precision 0.95, Recall 0.76, F1 0.84, PR-AUC 0.86, ROC-AUC 0.97
- Adaptive deterministic consensus (LR/RF margin tie-break): F1 ~0.85

## Notes

- The dataset file is large and should stay local (not committed).
- Model artifacts are loaded at backend startup, not per request.
- CORS allows `http://localhost:3000` for frontend dev.
