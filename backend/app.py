from fastapi import FastAPI
import joblib
import numpy as np
from pydantic import BaseModel
from typing import List
import os

app = FastAPI(
    title="Breast Cancer Prediction API",
    description="DSO2: Prédiction du stade tumoral (Benign, I-IV)\nDSO3: Prédiction du risque de récidive future",
    version="1.0"
)

# =======================
# DSO2: Stage Prediction
# =======================
model_dso2 = joblib.load('model_dso2.joblib')
scaler_dso2 = joblib.load('scaler_dso2.joblib')

n_classes_dso2 = model_dso2.n_classes_
classes_dso2 = model_dso2.classes_
print(f"[DSO2] Model loaded with {n_classes_dso2} classes: {classes_dso2}")

EXPECTED_FEATURES_DSO2 = 30

# =======================
# DSO3: Risk Prediction (Recurrence)
# =======================
if os.path.exists('model_dso3.joblib') and os.path.exists('scaler_dso3.joblib'):
    model_dso3 = joblib.load('model_dso3.joblib')
    scaler_dso3 = joblib.load('scaler_dso3.joblib')
    print("[DSO3] Model and scaler loaded successfully")
    DSO3_AVAILABLE = True
else:
    print("[DSO3] Warning: model_dso3.joblib or scaler_dso3.joblib not found → /predict_risk disabled")
    DSO3_AVAILABLE = False

# Input models
class InputDSO2(BaseModel):
    features: List[float]

    model_config = {
        "json_schema_extra": {
            "examples": [{
                "features": [
                    17.99, 10.38, 122.8, 1001.0, 0.1184, 0.2776, 0.3001, 0.1471, 0.2419, 0.07871,
                    1.095, 0.9053, 8.589, 153.4, 0.006399, 0.04904, 0.05373, 0.01587, 0.03003, 0.006193,
                    25.38, 17.33, 184.6, 2019.0, 0.1622, 0.6656, 0.7119, 0.2654, 0.4601, 0.1189
                ]
            }]
        }
    }

class InputDSO3(BaseModel):
    features: List[float]

    model_config = {
        "json_schema_extra": {
            "examples": [{
                "features": [0.0] * 33  # WPBC usually has ~33 features — adjust later if needed
            }]
        }
    }

@app.get("/")
def root():
    return {
        "message": "API Breast Cancer prête !",
        "endpoints": {
            "/predict_stage": "DSO2 - Stade tumoral (30 features)",
            "/predict_risk": "DSO3 - Risque de récidive" if DSO3_AVAILABLE else "DSO3 non disponible"
        }
    }

@app.post("/predict_stage")
def predict_stage(input_data: InputDSO2):
    data = np.array([input_data.features])

    if data.shape[1] != EXPECTED_FEATURES_DSO2:
        return {"error": f"DSO2 attend exactement {EXPECTED_FEATURES_DSO2} features, reçu {data.shape[1]}"}

    data_scaled = scaler_dso2.transform(data)
    prediction = int(model_dso2.predict(data_scaled)[0])
    probabilities = model_dso2.predict_proba(data_scaled)[0]

    label_map = {0: "Benign (0)", 1: "Stage I", 2: "Stage II", 3: "Stage III", 4: "Stage IV"}
    
    prob_dict = {}
    for i, cls in enumerate(classes_dso2):
        label = label_map.get(cls, f"Classe {cls}")
        prob_dict[label] = float(probabilities[i])
    
    if 0 not in classes_dso2:
        prob_dict["Benign (0)"] = 0.0

    return {
        "predicted_stage": label_map.get(prediction, "Inconnu"),
        "stage_code": prediction,
        "probabilities": prob_dict
    }

# DSO3 endpoint
if DSO3_AVAILABLE:
    @app.post("/predict_risk")
    def predict_risk(input_data: InputDSO3):
        data = np.array([input_data.features])
        expected = scaler_dso3.scale_.shape[0]
        
        if data.shape[1] != expected:
            return {"error": f"DSO3 attend {expected} features, reçu {data.shape[1]}"}
        
        data_scaled = scaler_dso3.transform(data)
        risk_prob = model_dso3.predict_proba(data_scaled)[0][1]
        
        return {
            "future_risk_probability_percent": round(float(risk_prob) * 100, 2),
            "risk_level": "Élevé" if risk_prob > 0.5 else "Faible",
            "probability_recurrence": float(risk_prob)
        }
else:
    @app.post("/predict_risk")
    def predict_risk():
        return {"error": "DSO3 non disponible : entraînez et sauvegardez model_dso3.joblib + scaler_dso3.joblib"}