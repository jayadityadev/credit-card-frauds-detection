# Copilot Instructions — Credit Card Fraud Detection

## Project progress

Use this section to understand what has already been completed and what the current state of all artifacts is. Do not re-do completed steps or contradict decisions already validated by results.

### Phase 0 — Environment setup ✅
- WSL2, Python 3.12, `uv` venv created
- All ML and backend packages installed
- Next.js frontend scaffolded with TypeScript + Tailwind (App Router)
- Repo structure created as specified

### Phase 1 — EDA ✅
- Dataset confirmed: 284,807 rows × 31 columns, zero nulls, all float64 except `Class` (int64)
- Class distribution confirmed: 284,315 legit / 492 fraud (0.172% fraud rate)
- Key finding: fraud transactions are capped ~$2,500; legit go up to ~$25,000 — justifies `RobustScaler`
- Top features correlated with fraud (from heatmap): V14 (-0.79), V4 (+0.74), V12 (-0.73), V11 (+0.71), V10 (-0.68), V16 (-0.64), V17 (-0.62)
- KDE plots confirm V14, V17, V12, V10 show strong class separation; Amount shows poor separation despite range difference
- All 4 EDA plots generated and saved: `class_distribution.png`, `amount_boxplot.png`, `correlation_heatmap.png`, `kde_features.png`

### Phase 2 — Preprocessing ✅
- `RobustScaler` fitted on `Amount` and `Time`; raw columns dropped; `Amount_scaled` and `Time_scaled` used
- Train/test split: `test_size=0.2`, `stratify=y`, `random_state=42`
  - Test set: 56,962 rows, 98 fraud
- SMOTE applied to training set only → balanced ~454k rows
- Artifacts saved: `data/train_smote.joblib`, `data/test.joblib`, `backend/models/scaler.joblib`

### Phase 3 — Model training ✅
- All training ran locally (GTX 1650 not used — sklearn is CPU-only)
- Training times: Isolation Forest 5.9s · Logistic Regression 3.2s · Random Forest 1m50s
- Isolation Forest trained on **pre-SMOTE** `X_train` (unsupervised — correct)
- LR and RF trained on **post-SMOTE** `X_train_resampled`
- Threshold tuning completed: LR = 0.89, RF = 0.80 (stored in `thresholds.joblib`)
- All 5 artifacts saved to `backend/models/`

### Phase 4 — Evaluation ✅
Confirmed results on test set (56,962 rows, 98 fraud):

| Model | Precision | Recall | F1 | PR-AUC | ROC-AUC |
|---|---|---|---|---|---|
| Isolation Forest | 0.24 | 0.31 | 0.27 | 0.15 | 0.95 |
| Logistic Regression | 0.19 | 0.89 | 0.31 | 0.72 | 0.97 |
| Random Forest | 0.95 | 0.76 | 0.84 | 0.86 | 0.97 |

- Isolation Forest: binary label is not used for final API decision; expose `decision_function()` score (negated) as anomaly score.
- Logistic Regression: high recall (catches 87/98 fraud) but 377 false positives — precision 0.19.
- Random Forest: strongest single classifier balance — 74/98 fraud caught, only 4 false positives, F1 = 0.84.
- Adaptive deterministic consensus (LR/RF margin tie-break) improves final F1 to ~0.85 on test set.
- RF feature importance confirms EDA: V14 dominates, followed by V10, V4, V17, V12.
- All evaluation plots generated: `confusion_matrices.png`, `roc_pr_curves.png`, `feature_importance.png`

### Phase 5 — FastAPI backend ✅
- `/health` and `/predict` endpoints validated.
- Inference uses scaler + correct feature ordering.
- Response contract includes `isolation_forest_anomaly_score` and deterministic `consensus`.

### Phase 6 — Next.js frontend ✅
- CSV-row paste UX implemented (30/31-value row parsing).
- FastAPI integration via `frontend/lib/api.ts` completed.
- Result cards for IF score, LR, RF, and final consensus implemented.

### Phase 7 — Integration + polish ✅
- End-to-end backend + frontend integration verified locally.
- CORS policy validated (`localhost:3000` allowed, other dev origins blocked).
- Demo legit/fraud sample flows validated through live API.

---

## Isolation Forest inference decision

Do NOT use `iso.predict()` binary output in the API — it catches 0 fraud at the fitted threshold. Instead, expose the raw anomaly score:

```python
iso_score = float(-iso.decision_function(X)[0])  # higher = more anomalous
```

Return this as `isolation_forest_anomaly_score: float` in the API response alongside the binary LR/RF verdicts. The frontend displays it as a gauge/score rather than a fraud/legit label.

---

## Project overview

Full-stack ML web app for credit card fraud detection. College project submission.

- **Dataset:** Kaggle European cardholders dataset (`creditcard.csv`) — 284,807 transactions, 492 fraud (0.172%)
- **Models:** Isolation Forest, Logistic Regression, Random Forest (all scikit-learn)
- **Backend:** FastAPI (Python 3.12, WSL2)
- **Frontend:** Next.js 14 (App Router, TypeScript, Tailwind)
- **Model artifacts:** serialized with `joblib`, stored in `backend/models/`

---

## Repo structure

```
credit-fraud/
├── notebooks/            # EDA, preprocessing, training, evaluation (.ipynb)
├── backend/
│   ├── main.py           # FastAPI app entrypoint
│   ├── schemas.py        # Pydantic v2 models
│   ├── predictor.py      # Model loading + inference logic
│   └── models/           # .joblib files (gitignored)
├── frontend/             # Next.js app
│   └── app/
│       ├── page.tsx
│       ├── components/
│       └── lib/api.ts    # axios wrapper for FastAPI
└── data/                 # gitignored; contains creditcard.csv
```

---

## Backend conventions

- **Framework:** FastAPI. Entry point is `backend/main.py`. Run with `uvicorn main:app --reload --port 8000`.
- **Pydantic version:** v2. Always use `model_dump()`, never `dict()`. Always use `model_validate()`, never `parse_obj()`.
- **CORS:** allowed origin is `http://localhost:3000` only (Next.js dev).
- **Model loading:** models are loaded once at module level in `predictor.py` via `joblib.load()`. Never reload per request.
- **Scaler:** `RobustScaler` is used for `Amount` and `Time`. The fitted scaler is saved as `backend/models/scaler.joblib`. Always apply it at inference time before passing features to models.
- **Feature order:** drop raw `Amount` and `Time` after scaling; use `Amount_scaled` and `Time_scaled` instead. Feature columns must match training order exactly.
- **Thresholds:** optimal decision thresholds for LR and RF are stored in `backend/models/thresholds.joblib` as a dict `{'lr': float, 'rf': float}`. Never hardcode 0.5.
- **Isolation Forest output:** `predict()` returns `-1` (anomaly/fraud) or `1` (normal). Convert to `int` label via `(pred == -1).astype(int)`. For probability-style scores use `decision_function()` negated: `-iso.decision_function(X)`.
- **Consensus logic:** deterministic binary decision from LR/RF only. If LR and RF agree, use that label; if they disagree, use the model with stronger normalized margin from its tuned threshold. Do not include Isolation Forest binary label in voting.
- **Python version:** 3.12. Do not use features exclusive to 3.13+.
- **Package manager:** `uv`. Do not suggest `pip install` directly — suggest `uv pip install`.
- **No training code in the backend.** Training lives in notebooks only. Backend only does inference.

---

## ML conventions

- **Imbalance handling:** SMOTE from `imbalanced-learn`. Applied to training split only — never to test data.
- **Scaler:** always `RobustScaler`, not `StandardScaler` or `MinMaxScaler`. Reason: `Amount` has heavy outliers from fraud transactions.
- **Train/test split:** `test_size=0.2`, `stratify=y`, `random_state=42` always.
- **V1–V28:** already PCA-transformed by the dataset authors. Do not re-scale or re-transform these features.
- **Evaluation metrics:** F1-score and PR-AUC are primary. Accuracy is not reported — dataset is severely imbalanced. ROC-AUC is secondary.
- **Random state:** `42` everywhere for reproducibility.
- **Heavy training** (Random Forest, SMOTE) runs on Kaggle Notebooks — local machine has GTX 1650 (4GB VRAM), not suitable. Do not suggest local GPU training.
- **Artifact naming:**
  - `isolation_forest.joblib`
  - `logistic_regression.joblib`
  - `random_forest.joblib`
  - `scaler.joblib`
  - `thresholds.joblib`

---

## Frontend conventions

- **Framework:** Next.js 14, App Router, TypeScript strict mode, Tailwind CSS.
- **API calls:** use `axios` via `frontend/lib/api.ts`. The base URL is `process.env.NEXT_PUBLIC_API_URL`, defaulting to `http://localhost:8000`.
- **No Next.js API routes** for ML inference — call FastAPI directly from the client.
- **Transaction input UX:** V1–V28 are opaque PCA features — the UI must support pasting a raw CSV row and auto-parsing it into fields. Do not build a 30-field manual form.
- **Results display:** show IF anomaly score card plus LR/RF verdict cards and a binary consensus verdict. Use green for legit and red for fraud.
- **No SSR for prediction calls** — all inference is client-side `fetch`/`axios` to the FastAPI backend.
- **Component location:** `frontend/app/components/`. No `src/` directory.
- **Env file:** `frontend/.env.local` for `NEXT_PUBLIC_API_URL`.

---

## What not to do

- Do not apply SMOTE to test data.
- Do not use `StandardScaler` or `MinMaxScaler`.
- Do not use `pickle` — always `joblib` for sklearn artifacts.
- Do not load models per request — load at startup only.
- Do not report accuracy as a primary metric.
- Do not use `dict()` or `parse_obj()` — Pydantic v2 only.
- Do not add training logic to the FastAPI backend.
- Do not hardcode decision threshold as 0.5 for LR or RF.
- Do not re-scale V1–V28 features.
- Do not use `pip install` — use `uv pip install`.