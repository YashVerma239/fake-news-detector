# ml-service/model/train_model.py
# Train a Logistic Regression model with TF-IDF on fake news data
# 
# Dataset: Use Kaggle "Fake and Real News Dataset"
# Download from: https://www.kaggle.com/clmentbisaillon/fake-and-real-news-dataset
# Files needed: Fake.csv and True.csv → place in this directory
#
# If no dataset is available, this script creates a mock model for demo purposes.

import os
import sys
import joblib
import numpy  as np
import pandas as pd

from sklearn.linear_model      import LogisticRegression
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline          import Pipeline
from sklearn.model_selection   import train_test_split
from sklearn.metrics           import accuracy_score, classification_report

# Add parent directory to path for preprocessor
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from preprocessor import preprocess

# ── Paths ─────────────────────────────────────────────────────────────────────
SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
FAKE_CSV    = os.path.join(SCRIPT_DIR, 'Fake.csv')
TRUE_CSV    = os.path.join(SCRIPT_DIR, 'True.csv')
MODEL_PATH  = os.path.join(SCRIPT_DIR, 'fake_news_model.pkl')


def load_real_dataset():
    """Load and merge Fake.csv and True.csv from Kaggle dataset."""
    print("📦 Loading Kaggle Fake News dataset...")

    fake_df = pd.read_csv(FAKE_CSV)
    true_df = pd.read_csv(TRUE_CSV)

    # Label: 0 = FAKE, 1 = REAL
    fake_df['label'] = 0
    true_df['label'] = 1

    # Combine title + text for richer features
    for df in [fake_df, true_df]:
        df['full_text'] = df.get('title', '') + ' ' + df.get('text', '')

    combined = pd.concat([
        fake_df[['full_text', 'label']],
        true_df[['full_text', 'label']],
    ], ignore_index=True)

    # Shuffle dataset
    combined = combined.sample(frac=1, random_state=42).reset_index(drop=True)

    # Drop rows with empty text
    combined.dropna(subset=['full_text'], inplace=True)
    combined = combined[combined['full_text'].str.strip() != '']

    print(f"   Total samples: {len(combined)}")
    print(f"   Fake: {(combined['label'] == 0).sum()}, Real: {(combined['label'] == 1).sum()}")
    return combined


def create_mock_dataset():
    """
    Create a synthetic training dataset for demo purposes.
    In production, replace this with the Kaggle dataset.
    """
    print("⚠️  No dataset found. Creating mock training data for demonstration.")
    print("   For better accuracy, download Fake.csv and True.csv from Kaggle.\n")

    fake_samples = [
        "SHOCKING: Government hiding alien contact since 1950s exposed by insider whistleblower",
        "BREAKING: Mainstream media suppressing bombshell evidence about deep state conspiracy",
        "You won't believe what they don't want you to know about the global elite agenda",
        "Anonymous sources reveal secret plot to control world population through vaccines",
        "URGENT: Share before they take this down - hidden cure for cancer suppressed by big pharma",
        "Celebrity exposé: Shocking truth about Hollywood rituals the media won't report",
        "EXCLUSIVE: Leaked documents prove election was completely staged by shadow government",
        "Scientists silenced after discovering truth about chemtrails and mind control",
        "Cover-up exposed: The real reason they banned this common food ingredient",
        "Viral video proves moon landing was filmed in secret Hollywood studio by NASA",
        "Deep state operatives planning false flag attack warns anonymous government insider",
        "Bombshell: Mainstream news is 100% fake according to this viral investigation",
        "SHOCKING revelation: These everyday foods are deliberately poisoned by globalists",
        "Censored study proves 5G towers are used for population control surveillance",
        "They are hiding the cure for diabetes — Big Pharma exposed in leaked memo",
    ] * 20  # Repeat for more samples

    real_samples = [
        "Federal Reserve announces 0.25 percentage point interest rate increase amid inflation concerns",
        "Scientists publish peer-reviewed study on climate change impacts in Nature journal",
        "Congressional budget committee approves funding bill after bipartisan negotiations",
        "University research team discovers potential treatment for Alzheimer's disease",
        "Central bank reports steady economic growth in quarterly financial assessment",
        "International climate summit concludes with agreement on carbon emission reductions",
        "Public health officials recommend updated vaccine schedule for flu season",
        "Local government approves infrastructure spending plan for road improvements",
        "Tech company reports quarterly earnings in SEC filing ahead of analyst expectations",
        "Supreme Court issues ruling on constitutional challenge to federal regulation",
        "State legislature passes education reform bill after months of committee review",
        "Medical researchers publish results of clinical trial in peer-reviewed journal",
        "Treasury department releases annual report on national debt and fiscal outlook",
        "Environmental agency announces new regulations on industrial water pollution",
        "Census bureau releases demographic data showing population growth trends",
    ] * 20

    texts  = fake_samples + real_samples
    labels = [0] * len(fake_samples) + [1] * len(real_samples)

    df = pd.DataFrame({'full_text': texts, 'label': labels})
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    return df


def train_and_save():
    """Train the NLP pipeline and save the model."""

    # ── Load Data ──────────────────────────────────────────────────────────────
    if os.path.exists(FAKE_CSV) and os.path.exists(TRUE_CSV):
        df = load_real_dataset()
    else:
        df = create_mock_dataset()

    # ── Preprocess text ────────────────────────────────────────────────────────
    print("\n🔄 Preprocessing text (this may take a few minutes)...")
    df['processed'] = df['full_text'].apply(preprocess)

    # ── Split dataset ──────────────────────────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        df['processed'], df['label'],
        test_size=0.2, random_state=42, stratify=df['label']
    )
    print(f"   Train: {len(X_train)} | Test: {len(X_test)}")

    # ── Build Pipeline: TF-IDF + Logistic Regression ──────────────────────────
    print("\n🧠 Training model (TF-IDF + Logistic Regression)...")
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            max_features=50000,    # Vocabulary size
            ngram_range=(1, 2),    # Unigrams + bigrams
            min_df=2,              # Ignore very rare terms
            max_df=0.95,           # Ignore very common terms
            sublinear_tf=True,     # Apply log normalization
        )),
        ('clf', LogisticRegression(
            C=5.0,                 # Regularization strength
            max_iter=1000,
            solver='lbfgs',
            random_state=42,
            class_weight='balanced',
        )),
    ])

    pipeline.fit(X_train, y_train)

    # ── Evaluate ───────────────────────────────────────────────────────────────
    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n📊 Model Accuracy: {accuracy * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['FAKE', 'REAL']))

    # ── Save Model ─────────────────────────────────────────────────────────────
    joblib.dump(pipeline, MODEL_PATH)
    print(f"\n✅ Model saved to: {MODEL_PATH}")
    return pipeline


if __name__ == '__main__':
    train_and_save()