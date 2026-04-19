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