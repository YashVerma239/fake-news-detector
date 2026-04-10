# ml-service/app.py
# Flask REST API for Fake News Detection ML Model

import os
import sys
import joblib
import numpy as np
from flask      import Flask, request, jsonify
from flask_cors import CORS

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from preprocessor import preprocess, find_suspicious_words, classify_category

# ── Flask App Setup ───────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, origins=['http://localhost:5000', 'http://localhost:3000'])

# ── Model Loading ─────────────────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'fake_news_model.pkl')

model = None

def load_model():
    """Load the trained ML model. Train it first if not found."""
    global model
    try:
        if os.path.exists(MODEL_PATH):
            print(f"✅ Loading model from {MODEL_PATH}")
            model = joblib.load(MODEL_PATH)
            print("✅ Model loaded successfully!")
        else:
            print(f"⚠️ Model not found at {MODEL_PATH}")
            print(f"📁 Current dir: {os.getcwd()}")
            print(f"📁 Dir contents: {os.listdir(os.path.dirname(MODEL_PATH))}")
            sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'model'))
            from train_model import train_and_save
            model = train_and_save()
            print("✅ Model trained and ready!")
    except Exception as e:
        print(f"❌ Model load error: {e}")
        import traceback
        traceback.print_exc()

# Load model at startup
load_model()


# ── Helper Functions ──────────────────────────────────────────────────────────

def generate_explanation(prediction: str, confidence: float, suspicious_words: list) -> str:
    """Generate a human-readable explanation for the prediction."""
    conf_pct = round(confidence)

    if prediction == 'FAKE':
        if suspicious_words:
            words_str = ', '.join(f'"{w}"' for w in suspicious_words[:3])
            return (
                f"Our model detected this as fake news with {conf_pct}% confidence. "
                f"The content contains sensational language indicators ({words_str}) "
                f"commonly associated with misinformation. We recommend verifying "
                f"this information through credible news sources."
            )
        return (
            f"This article was classified as likely fake with {conf_pct}% confidence. "
            f"The writing patterns, tone, and language structure are consistent with "
            f"content identified as misinformation in our training data."
        )
    else:
        return (
            f"This article appears to be legitimate news with {conf_pct}% confidence. "
            f"The writing style, factual tone, and language patterns are consistent "
            f"with credible journalism. The content lacks common misinformation indicators."
        )


# ── API Routes ────────────────────────────────────────────────────────────────

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'service': 'Fake News Detection ML Service',
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint.
    
    Request body:
        { "text": "News article text here..." }
    
    Response:
        {
            "prediction": "FAKE" | "REAL",
            "confidence": 87.4,
            "explanation": "...",
            "suspicious_words": [...],
            "category": "Politics"
        }
    """
    # ── Validate Request ───────────────────────────────────────────────────────
    if not request.is_json:
        return jsonify({'error': 'Request must be JSON'}), 400

    data = request.get_json()
    text = data.get('text', '').strip()

    if not text:
        return jsonify({'error': 'Text field is required'}), 400

    if len(text) < 10:
        return jsonify({'error': 'Text too short for analysis'}), 400

    if len(text) > 10000:
        return jsonify({'error': 'Text too long. Maximum 10,000 characters.'}), 400

    try:
        # ── Preprocess ─────────────────────────────────────────────────────────
        processed_text = preprocess(text)

        # ── Predict ────────────────────────────────────────────────────────────
        # Get prediction label (0=FAKE, 1=REAL)
        pred_label = model.predict([processed_text])[0]

        # Get probability scores
        proba = model.predict_proba([processed_text])[0]

        # Confidence = probability of the predicted class
        confidence = float(proba[pred_label] * 100)

        prediction = 'REAL' if pred_label == 1 else 'FAKE'

        # ── Post-processing ────────────────────────────────────────────────────
        suspicious_words = find_suspicious_words(text)
        category         = classify_category(text)
        explanation      = generate_explanation(prediction, confidence, suspicious_words)

        # ── Boost confidence slightly for extreme cases (UX improvement) ───────
        # Raw LR models sometimes give mediocre confidence even for clear cases
        if confidence < 55:
            confidence = 55 + (confidence - 50) * 0.8  # Smooth near 50%

        return jsonify({
            'prediction':       prediction,
            'confidence':       round(confidence, 2),
            'fake_probability': round(float(proba[0] * 100), 2),
            'real_probability': round(float(proba[1] * 100), 2),
            'explanation':      explanation,
            'suspicious_words': suspicious_words,
            'category':         category,
        })

    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500


@app.route('/batch-predict', methods=['POST'])
def batch_predict():
    """
    Batch prediction endpoint for multiple texts.
    
    Request body:
        { "texts": ["article 1...", "article 2..."] }
    """
    data  = request.get_json()
    texts = data.get('texts', [])

    if not texts or not isinstance(texts, list):
        return jsonify({'error': 'texts array is required'}), 400

    if len(texts) > 10:
        return jsonify({'error': 'Maximum 10 texts per batch request'}), 400

    results = []
    for text in texts:
        processed = preprocess(str(text))
        pred_label = model.predict([processed])[0]
        proba      = model.predict_proba([processed])[0]
        confidence = float(proba[pred_label] * 100)
        prediction = 'REAL' if pred_label == 1 else 'FAKE'

        results.append({
            'prediction': prediction,
            'confidence': round(confidence, 2),
        })

    return jsonify({'results': results})


# ── Start Server ──────────────────────────────────────────────────────────────
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print(f"\n🤖 ML Service running on port {port}")
    print(f"📡 Predict endpoint: http://localhost:{port}/predict\n")
    app.run(host='0.0.0.0', port=port, debug=False)