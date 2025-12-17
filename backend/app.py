from fastapi import FastAPI
import tensorflow as tf
import joblib
import numpy as np
from pydantic import BaseModel
from typing import List

app = FastAPI()

# Charge le modèle et le scaler au démarrage de l'app
model = tf.keras.models.load_model('my_model.keras')
scaler = joblib.load('scaler.joblib')

# Définit le format de l'input JSON (une liste de 30 floats pour les features)
class PredictionInput(BaseModel):
    features: List[float]  # Ex: [14.5, 20.1, ..., 0.123] – ordre exact comme dans X.columns

@app.get("/")
def root():
    return {"message": "API pour diagnostic breast cancer (DSO 1). Utilise /predict pour les prédictions."}

@app.post("/predict")
def predict(input_data: PredictionInput):
    # Convertit la liste en array NumPy (batch de 1)
    data = np.array([input_data.features])
    
    # Vérifie le nombre de features (pour éviter les erreurs)
    if data.shape[1] != model.input_shape[1]:  # model.input_shape[1] = n_input (30)
        return {"error": f"Attendu {model.input_shape[1]} features, reçu {data.shape[1]}"}
    
    # Scale les données
    data_scaled = scaler.transform(data)
    
    # Prédiction (probabilité de malin)
    prob = model.predict(data_scaled)[0][0]
    prob = float(prob)  # Convertit en float simple pour JSON
    
    # Diagnostic basé sur threshold 0.5 (tu peux ajuster si besoin)
    diagnosis = "Malignant" if prob > 0.5 else "Benign"
    
    return {
        "probability_malignant": prob,
        "diagnosis": diagnosis
    }