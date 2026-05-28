# Copilot Instructions — Credit Card Fraud Detection

Use this file as the single source of truth for project-wide behavior. Keep details that are hard to infer from code; link to docs for the rest.

## Start Here

- Read [README.md](README.md) and [ROADMAP.md](ROADMAP.md) for the project summary, pipeline phases, and evaluation snapshot.
- Use [frontend/AGENTS.md](frontend/AGENTS.md) when working under `frontend/`.
- The only repo-wide docs you should need beyond code are the README, roadmap, and the notebook artifacts already checked in.

## Non-Negotiables

- Backend is inference-only. Do not add training logic to FastAPI.
- Models are loaded once at module import time from [backend/models/](backend/models/), never per request.
- Use `joblib` for sklearn artifacts, not `pickle`.
- Use Pydantic v2 patterns only: `model_dump()` and `model_validate()`, not `dict()` or `parse_obj()`.
- Use `uv` for Python environment/package commands. Do not recommend `pip install`.
- Preserve deterministic behavior: `random_state=42` everywhere, and no hardcoded `0.5` thresholds for LR or RF.

## ML Pipeline Rules

- Fit `RobustScaler` on `Amount` and `Time` together, then drop the raw columns and use `Amount_scaled` and `Time_scaled`.
- Apply SMOTE only to the training split. Never touch test data.
- Keep V1–V28 as-is. They are already PCA-transformed.
- Keep feature order identical between training and inference.
- Use the saved artifacts in [backend/models/](backend/models/) with these names: `isolation_forest.joblib`, `logistic_regression.joblib`, `random_forest.joblib`, `scaler.joblib`, `thresholds.joblib`.
- Isolation Forest is exposed as a negated `decision_function()` anomaly score, not a binary vote.
- Final consensus is deterministic from LR and RF only. If they disagree, use the stronger normalized margin from the tuned threshold.

## Backend Contract

- Entry point: [backend/main.py](backend/main.py). FastAPI serves `/health` and `/predict`.
- Schema definitions live in [backend/schemas.py](backend/schemas.py). Keep the request model aligned with the 30 input features.
- Prediction logic lives in [backend/predictor.py](backend/predictor.py). It validates the scaler artifact and applies the saved thresholds.
- CORS is intentionally limited to `http://localhost:3000` for local Next.js development.

## Frontend Contract

- The app uses Next.js App Router with TypeScript and Tailwind in [frontend/app/](frontend/app/).
- Client-side prediction calls go through [frontend/lib/api.ts](frontend/lib/api.ts); there are no Next.js API routes for inference.
- Transaction input is a pasted CSV row, not a 30-field manual form. The parser accepts 30 or 31 values and auto-skips the header row when present.
- Result UI shows the Isolation Forest anomaly score plus LR, RF, and consensus verdict cards.

## Code Review Traps

- Do not rescale or retrain V1–V28.
- Do not reload model artifacts inside request handlers.
- Do not use the Isolation Forest binary label as part of the final vote.
- Do not apply SMOTE to the test split.
- Do not change the backend response shape without updating the frontend types at the same time.