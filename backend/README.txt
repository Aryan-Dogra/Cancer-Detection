================================================
OncoCare - Cancer Detection Backend Setup Guide
================================================

FOLDER STRUCTURE:
-----------------
backend/
├── app.py              <- Flask API server
├── models/             <- Place your .pkl files here
│   ├── liver_model.pkl
│   ├── lung_model.pkl
│   ├── kidney_model.pkl
│   └── skin_model.pkl
├── pyproject.toml      <- Python dependencies
└── README.txt          <- This file


STEP 1: Place Your Model Files
------------------------------
Copy your 4 trained .pkl files into the 'models' folder.
Name them exactly as shown above:
  - liver_model.pkl
  - lung_model.pkl
  - kidney_model.pkl
  - skin_model.pkl


STEP 2: Run the Flask Server
----------------------------
Open a terminal in the 'backend' folder and run:

    uv run app.py

The server will start at: http://localhost:5000


STEP 3: Open the Frontend
-------------------------
Open the HTML files in your browser or serve them:
  - public/index.html (main page)
  - public/liver.html
  - public/lung.html
  - public/kidney.html
  - public/skin.html


API ENDPOINTS:
--------------
POST /api/predict/liver
  Input: { age, alcohol, bilirubin, sgpt, sgot, fatigue }

POST /api/predict/lung
  Input: { age, smoking, cough, chest_pain, fatigue, shortness_of_breath }

POST /api/predict/kidney
  Input: { age, blood_pressure, albumin, sugar, creatinine, fatigue, swelling }

POST /api/predict/skin
  Input: { age, sun_exposure, skin_type, lesion_size, family_history, itching, bleeding }


RESPONSE FORMAT:
----------------
{
    "success": true,
    "cancer_type": "Liver Cancer",
    "risk_percentage": 45.67,
    "risk_level": "moderate",  // low, moderate, high, very-high
    "input_features": [...]
}


MODEL REQUIREMENTS:
-------------------
Your scikit-learn models should:
1. Have a predict_proba() method (for probability output)
2. Accept the features in the exact order listed above
3. Return binary classification (0 = no cancer, 1 = cancer)


TROUBLESHOOTING:
----------------
1. "Model not loaded" error:
   - Check that .pkl files are in the 'models' folder
   - Check file names match exactly

2. CORS errors in browser:
   - Flask-CORS is already configured
   - Make sure Flask server is running

3. Wrong predictions:
   - Verify feature order matches your training data
   - Check data types (float vs int)
