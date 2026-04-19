import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Transaction {
  V1: number;
  V2: number;
  V3: number;
  V4: number;
  V5: number;
  V6: number;
  V7: number;
  V8: number;
  V9: number;
  V10: number;
  V11: number;
  V12: number;
  V13: number;
  V14: number;
  V15: number;
  V16: number;
  V17: number;
  V18: number;
  V19: number;
  V20: number;
  V21: number;
  V22: number;
  V23: number;
  V24: number;
  V25: number;
  V26: number;
  V27: number;
  V28: number;
  Amount: number;
  Time: number;
}

export interface PredictionResult {
  isolation_forest_anomaly_score: number;
  logistic_regression: "fraud" | "legit";
  random_forest: "fraud" | "legit";
  rf_fraud_probability: number;
  lr_fraud_probability: number;
  consensus: "fraud" | "legit";
}

export async function predictFraud(txn: Transaction): Promise<PredictionResult> {
  const res = await axios.post<PredictionResult>(`${API_BASE}/predict`, txn);
  return res.data;
}
