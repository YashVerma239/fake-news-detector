# ml-service/preprocessor.py
# Text preprocessing pipeline: cleaning, tokenization, stopword removal

import re
import string
import nltk

# Download required NLTK data on first run
def download_nltk_data():
    """Download required NLTK corpora if not already present."""
    resources = [
        ('corpora/stopwords',   'stopwords'),
        ('tokenizers/punkt',    'punkt'),
        ('corpora/wordnet',     'wordnet'),
    ]
    for path, name in resources:
        try:
            nltk.data.find(path)
        except LookupError:
            print(f"Downloading NLTK resource: {name}")
            nltk.download(name, quiet=True)

download_nltk_data()

from nltk.corpus   import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem     import WordNetLemmatizer

# Initialize tools
STOP_WORDS  = set(stopwords.words('english'))
LEMMATIZER  = WordNetLemmatizer()

# Suspicious/sensational words commonly found in fake news
FAKE_INDICATOR_WORDS = [
    'breaking', 'exclusive', 'shocking', 'unbelievable', 'secret', 'exposed',
    'bombshell', 'urgent', 'viral', 'conspiracy', 'hoax', 'cover-up',
    'mainstream media', 'deep state', 'anonymous', 'allegedly', 'rumored',
    'insiders', 'whistleblower', 'banned', 'censored', 'suppressed',
    'elites', 'globalists', 'agenda', 'false flag', 'staged', 'crisis actor',
]


def clean_text(text: str) -> str:
    """
    Full text cleaning pipeline:
    1. Lowercase
    2. Remove URLs
    3. Remove HTML tags
    4. Remove punctuation
    5. Remove extra whitespace
    6. Remove numbers (optional - can help reduce noise)
    """
    if not isinstance(text, str):
        return ''

    # Lowercase
    text = text.lower()

    # Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', ' ', text)

    # Remove HTML tags
    text = re.sub(r'<[^>]+>', ' ', text)

    # Remove punctuation
    text = text.translate(str.maketrans('', '', string.punctuation))

    # Remove numbers (standalone)
    text = re.sub(r'\b\d+\b', ' ', text)

    # Collapse multiple spaces
    text = re.sub(r'\s+', ' ', text).strip()

    return text


def preprocess(text: str) -> str:
    """
    Full NLP preprocessing pipeline:
    clean → tokenize → remove stopwords → lemmatize → rejoin
    """
    cleaned = clean_text(text)

    tokens = word_tokenize(cleaned)

    # Remove stopwords and short tokens (likely noise)
    filtered = [
        LEMMATIZER.lemmatize(tok)
        for tok in tokens
        if tok not in STOP_WORDS and len(tok) > 2
    ]

    return ' '.join(filtered)


def find_suspicious_words(text: str) -> list:
    """
    Scan original text for suspicious/sensational language patterns.
    Returns list of found indicator words.
    """
    text_lower = text.lower()
    found = []

    for word in FAKE_INDICATOR_WORDS:
        if word in text_lower:
            found.append(word)

    return found[:10]  # Return max 10


def classify_category(text: str) -> str:
    """
    Simple rule-based category classification.
    In production this would be another ML model.
    """
    text_lower = text.lower()

    categories = {
        'Politics':      ['president', 'congress', 'senate', 'election', 'government', 'democrat', 'republican', 'vote', 'political'],
        'Health':        ['covid', 'vaccine', 'virus', 'disease', 'medical', 'hospital', 'health', 'cure', 'drug'],
        'Technology':    ['ai', 'robot', 'tech', 'software', 'internet', 'hack', 'cyber', 'data'],
        'Environment':   ['climate', 'global warming', 'pollution', 'environment', 'carbon', 'fossil'],
        'Finance':       ['economy', 'stock', 'market', 'bitcoin', 'crypto', 'bank', 'finance', 'dollar'],
        'Science':       ['nasa', 'space', 'research', 'study', 'scientists', 'discovery'],
        'Entertainment': ['celebrity', 'movie', 'music', 'actor', 'actress', 'film', 'show'],
    }

    for category, keywords in categories.items():
        if any(kw in text_lower for kw in keywords):
            return category

    return 'General'