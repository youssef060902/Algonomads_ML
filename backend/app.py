from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import numpy as np
import tensorflow as tf
from pydantic import BaseModel
from typing import List
import os

app = FastAPI(
    title="Ena Healthy - Breast Cancer AI Assistant",
    description="API complète avec :\n"
                "• DSO1: Diagnostic Bénin/Malin (modèle Keras)\n"
                "• DSO2: Prédiction du stade tumoral (0, I, II, III, IV)\n"
                "• DSO3: Risque de récidive future",
    version="1.0"
)

# CORS configuration: allow frontend dev server to perform preflight requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =======================
# DSO1: Benign vs Malignant (Keras Model)
# =======================
print("[DSO1] Chargement du modèle Keras...")
model_dso1 = tf.keras.models.load_model('my_model.keras')
scaler_dso1 = joblib.load('scaler.joblib')
print("[DSO1] Modèle et scaler chargés avec succès")

EXPECTED_FEATURES_DSO1 = 30  # 30 features du WDBC

# =======================
# DSO2: Stage Prediction
# =======================
print("[DSO2] Chargement du modèle Random Forest...")
model_dso2 = joblib.load('model_dso2.joblib')
scaler_dso2 = joblib.load('scaler_dso2.joblib')
n_classes_dso2 = model_dso2.n_classes_
classes_dso2 = model_dso2.classes_
print(f"[DSO2] Modèle chargé avec {n_classes_dso2} classes: {classes_dso2}")

EXPECTED_FEATURES_DSO2 = 30

# =======================
# DSO3: Risk of Recurrence
# =======================
if os.path.exists('model_dso3.joblib') and os.path.exists('scaler_dso3.joblib'):
    model_dso3 = joblib.load('model_dso3.joblib')
    scaler_dso3 = joblib.load('scaler_dso3.joblib')
    print("[DSO3] Modèle et scaler chargés avec succès")
    DSO3_AVAILABLE = True
else:
    print("[DSO3] Modèles manquants → endpoint désactivé")
    DSO3_AVAILABLE = False

# Input models
class InputDSO1_DSO2(BaseModel):  # Même format : 30 features WDBC
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

class InputDSO3(BaseModel):  # 33 features WPBC
    features: List[float]

    model_config = {
        "json_schema_extra": {
            "examples": [{
                "features": [
                    27, 20.29, 14.34, 135.10, 1297.0, 0.10030, 0.13280, 0.19800, 0.10430, 0.1809, 0.05883,
                    0.7572, 0.7813, 5.438, 94.44, 0.011490, 0.02461, 0.05688, 0.01885, 0.01756, 0.005115,
                    22.54, 16.67, 152.20, 1575.0, 0.1374, 0.2050, 0.4000, 0.1625, 0.2364, 0.07678,
                    3.5, 0
                ]
            }]
        }
    }

@app.get("/")
def root():
    return {
        "message": "Bienvenue sur Ena Healthy API !",
        "endpoints": {
            "/predict": "DSO1 - Diagnostic Bénin/Malin (30 features)",
            "/predict_stage": "DSO2 - Stade tumoral (Benign 0 → IV)",
            "/predict_risk": "DSO3 - Risque de récidive future" if DSO3_AVAILABLE else "DSO3 non disponible"
        }
    }

# =========================
# DSO1: Benign vs Malignant
# =========================
@app.post("/predict")
def predict_dso1(input_data: InputDSO1_DSO2):
    data = np.array([input_data.features])
    if data.shape[1] != EXPECTED_FEATURES_DSO1:
        return {"error": f"DSO1 attend {EXPECTED_FEATURES_DSO1} features, reçu {data.shape[1]}"}

    data_scaled = scaler_dso1.transform(data)
    prob = float(model_dso1.predict(data_scaled, verbose=0)[0][0])
    diagnosis = "Malignant" if prob > 0.5 else "Benign"

    return {
        "probability_malignant": round(prob, 4),
        "diagnosis": diagnosis
    }

# =========================
# DSO2: Predict Stage
# =========================
@app.post("/predict_stage")
def predict_stage(input_data: InputDSO1_DSO2):
    data = np.array([input_data.features])
    if data.shape[1] != EXPECTED_FEATURES_DSO2:
        return {"error": f"DSO2 attend {EXPECTED_FEATURES_DSO2} features, reçu {data.shape[1]}"}

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

# =========================
# DSO3: Predict Recurrence Risk
# =========================
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
            "risk_level": "High" if risk_prob > 0.5 else "Low",
            "probability_recurrence": float(risk_prob)
        }
else:
    @app.post("/predict_risk")
    def predict_risk():
        return {"error": "DSO3 non disponible : veuillez entraîner et sauvegarder model_dso3.joblib + scaler_dso3.joblib"}