"""
OncoCare - Cancer Detection API
Flask backend for serving ML models
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Directory where .pkl model files are stored
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')

# Load models at startup
models = {}

def load_models():
    """Load all cancer detection models from .pkl files"""
    model_files = {
        'liver': 'liver_model.pkl',
        'lung': 'lung_model.pkl',
        'kidney': 'kidney_model.pkl',
        'skin': 'skin_model.pkl'
    }
    
    for cancer_type, filename in model_files.items():
        filepath = os.path.join(MODELS_DIR, filename)
        if os.path.exists(filepath):
            models[cancer_type] = joblib.load(filepath)
            print(f"✓ Loaded {cancer_type} model from {filename}")
        else:
            print(f"✗ Warning: {filename} not found in {MODELS_DIR}")

# Load models when app starts
load_models()


def get_risk_percentage(model, features):
    """
    Get risk percentage from model prediction.
    Uses predict_proba if available, otherwise uses predict.
    """
    features_array = np.array(features).reshape(1, -1)
    
    # Try to get probability prediction
    if hasattr(model, 'predict_proba'):
        probabilities = model.predict_proba(features_array)
        # Assuming binary classification: [no_cancer_prob, cancer_prob]
        # Return the probability of cancer (positive class)
        if probabilities.shape[1] == 2:
            risk_percentage = probabilities[0][1] * 100
        else:
            risk_percentage = max(probabilities[0]) * 100
    else:
        # If no probability, use prediction directly
        prediction = model.predict(features_array)
        risk_percentage = float(prediction[0]) * 100
    
    return round(risk_percentage, 2)


def get_risk_level(percentage):
    """Determine risk level based on percentage"""
    if percentage < 25:
        return 'low'
    elif percentage < 50:
        return 'moderate'
    elif percentage < 75:
        return 'high'
    else:
        return 'very-high'


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'models_loaded': list(models.keys())
    })


@app.route('/api/predict/liver', methods=['POST'])
def predict_liver():
    """
    Liver cancer prediction
    Expected input: [age, alcohol, bilirubin, sgpt, sgot, fatigue]
    """
    if 'liver' not in models:
        return jsonify({'error': 'Liver model not loaded'}), 500
    
    try:
        data = request.json
        features = [
            float(data['age']),
            int(data['alcohol']),       # 0 or 1
            float(data['bilirubin']),
            float(data['sgpt']),
            float(data['sgot']),
            int(data['fatigue'])        # 0 or 1
        ]
        
        risk_percentage = get_risk_percentage(models['liver'], features)
        risk_level = get_risk_level(risk_percentage)
        
        return jsonify({
            'success': True,
            'cancer_type': 'Liver Cancer',
            'risk_percentage': risk_percentage,
            'risk_level': risk_level,
            'input_features': features
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/predict/lung', methods=['POST'])
def predict_lung():
    """
    Lung cancer prediction
    Expected input: [age, smoking, cough, chest_pain, fatigue, shortness_of_breath]
    """
    if 'lung' not in models:
        return jsonify({'error': 'Lung model not loaded'}), 500
    
    try:
        data = request.json
        features = [
            float(data['age']),
            int(data['smoking']),           # 0 or 1
            int(data['cough']),             # 0 or 1
            int(data['chest_pain']),        # 0 or 1
            int(data['fatigue']),           # 0 or 1
            int(data['shortness_of_breath']) # 0 or 1
        ]
        
        risk_percentage = get_risk_percentage(models['lung'], features)
        risk_level = get_risk_level(risk_percentage)
        
        return jsonify({
            'success': True,
            'cancer_type': 'Lung Cancer',
            'risk_percentage': risk_percentage,
            'risk_level': risk_level,
            'input_features': features
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/predict/kidney', methods=['POST'])
def predict_kidney():
    """
    Kidney cancer prediction
    Expected input: [age, blood_pressure, albumin, sugar, creatinine, fatigue, swelling]
    """
    if 'kidney' not in models:
        return jsonify({'error': 'Kidney model not loaded'}), 500
    
    try:
        data = request.json
        features = [
            float(data['age']),
            float(data['blood_pressure']),
            float(data['albumin']),
            float(data['sugar']),
            float(data['creatinine']),
            int(data['fatigue']),   # 0 or 1
            int(data['swelling'])   # 0 or 1
        ]
        
        risk_percentage = get_risk_percentage(models['kidney'], features)
        risk_level = get_risk_level(risk_percentage)
        
        return jsonify({
            'success': True,
            'cancer_type': 'Kidney Cancer',
            'risk_percentage': risk_percentage,
            'risk_level': risk_level,
            'input_features': features
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/predict/skin', methods=['POST'])
def predict_skin():
    """
    Skin cancer prediction
    Expected input: [age, sun_exposure, skin_type, lesion_size, family_history, itching, bleeding]
    skin_type: 1=Fair, 2=Brown, 3=Dark
    """
    if 'skin' not in models:
        return jsonify({'error': 'Skin model not loaded'}), 500
    
    try:
        data = request.json
        features = [
            float(data['age']),
            int(data['sun_exposure']),   # 0 or 1
            int(data['skin_type']),      # 1, 2, or 3
            float(data['lesion_size']),
            int(data['family_history']), # 0 or 1
            int(data['itching']),        # 0 or 1
            int(data['bleeding'])        # 0 or 1
        ]
        
        risk_percentage = get_risk_percentage(models['skin'], features)
        risk_level = get_risk_level(risk_percentage)
        
        return jsonify({
            'success': True,
            'cancer_type': 'Skin Cancer',
            'risk_percentage': risk_percentage,
            'risk_level': risk_level,
            'input_features': features
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


    
if __name__ == '__main__':
    print("\n" + "="*50)
    print("OncoCare Cancer Detection API")
    print("="*50)
    print(f"\nModels directory: {MODELS_DIR}")
    print(f"Models loaded: {list(models.keys())}")
    print("="*50 + "\n")
    
    app.run(host="0.0.0.0", port=10000)
