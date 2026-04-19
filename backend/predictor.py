import joblib
import pandas as pd
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

        # Phase 2 contract: scaler is fitted on ['Amount', 'Time'] together.
        if getattr(self.scaler, "n_features_in_", None) != 2:
            raise ValueError(
                "Invalid scaler artifact: expected RobustScaler fitted on ['Amount', 'Time']. "
                "Regenerate Phase 2 artifacts and retrain models."
            )

        scaled = self.scaler.transform(df[["Amount", "Time"]])
        df["Amount_scaled"] = scaled[:, 0]
        df["Time_scaled"] = scaled[:, 1]
        df.drop(columns=['Amount', 'Time'], inplace=True)

        # Keep inference feature order identical to training.
        if hasattr(self.lr, "feature_names_in_"):
            df = df.reindex(columns=list(self.lr.feature_names_in_), fill_value=0.0)

        # Isolation Forest is exposed as a score, not a binary vote.
        iso_score = float(-self.iso.decision_function(df)[0])

        # Logistic Regression
        lr_prob = self.lr.predict_proba(df)[0][1]
        lr_label = 'fraud' if lr_prob >= self.thresholds['lr'] else 'legit'

        # Random Forest
        rf_prob = self.rf.predict_proba(df)[0][1]
        rf_label = 'fraud' if rf_prob >= self.thresholds['rf'] else 'legit'

        # Adaptive deterministic final decision (no ambiguous output):
        # compare each model's normalized margin from its tuned threshold and
        # trust the one with stronger confidence when LR/RF disagree.
        lr_margin = (lr_prob - self.thresholds['lr']) / max(self.thresholds['lr'], 1e-9)
        rf_margin = (rf_prob - self.thresholds['rf']) / max(self.thresholds['rf'], 1e-9)

        if lr_label == rf_label:
            consensus = lr_label
        else:
            consensus = lr_label if abs(lr_margin) > abs(rf_margin) else rf_label

        return {
            'isolation_forest_anomaly_score': round(iso_score, 6),
            'logistic_regression': lr_label,
            'random_forest': rf_label,
            'rf_fraud_probability': float(round(rf_prob, 4)),
            'lr_fraud_probability': float(round(lr_prob, 4)),
            'consensus': consensus,
        }

predictor = FraudPredictor()  # loaded once at module level