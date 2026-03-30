import os
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# =========================================================
# LABEL MAPPINGS
# =========================================================
sentiment_id2label = {
    0: "negative",
    1: "positive"
}

emotion_id2label = {
    0: "sadness",
    1: "joy",
    2: "love",
    3: "anger",
    4: "fear",
    5: "surprise"
}

# =========================================================
# MODEL SOURCES
# Use environment variables if provided.
# Otherwise fall back to your Hugging Face repos.
# =========================================================
SENTIMENT_MODEL_PATH = os.getenv(
    "SENTIMENT_MODEL_PATH",
    "Ahmadtareq34/sentiment-model"
)

EMOTION_MODEL_PATH = os.getenv(
    "EMOTION_MODEL_PATH",
    "Ahmadtareq34/emotion-model"
)

# Optional custom cache directory
HF_CACHE_DIR = os.getenv("HF_HOME", None)

# =========================================================
# DEVICE SETUP
# =========================================================
device = torch.device("cpu")

# =========================================================
# LOAD MODELS AND TOKENIZERS
# =========================================================
print(f"Loading sentiment model from: {SENTIMENT_MODEL_PATH}")
sentiment_tokenizer = AutoTokenizer.from_pretrained(
    SENTIMENT_MODEL_PATH,
    cache_dir=HF_CACHE_DIR
)
sentiment_model = AutoModelForSequenceClassification.from_pretrained(
    SENTIMENT_MODEL_PATH,
    cache_dir=HF_CACHE_DIR
)
sentiment_model.to(device)
sentiment_model.eval()

print(f"Loading emotion model from: {EMOTION_MODEL_PATH}")
emotion_tokenizer = AutoTokenizer.from_pretrained(
    EMOTION_MODEL_PATH,
    cache_dir=HF_CACHE_DIR
)
emotion_model = AutoModelForSequenceClassification.from_pretrained(
    EMOTION_MODEL_PATH,
    cache_dir=HF_CACHE_DIR
)
emotion_model.to(device)
emotion_model.eval()

print("Both models loaded successfully.\n")

# =========================================================
# HELPER FUNCTION
# =========================================================
def predict_with_model(text, tokenizer, model, id2label, max_length=128):
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=max_length
    )

    inputs = {key: value.to(device) for key, value in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)
        probabilities = torch.softmax(outputs.logits, dim=1).cpu().numpy()[0]

    predicted_id = int(np.argmax(probabilities))
    predicted_label = id2label[predicted_id]
    confidence = float(probabilities[predicted_id])

    probability_map = {
        id2label[i]: round(float(probabilities[i]), 4)
        for i in range(len(probabilities))
    }

    return predicted_label, confidence, probability_map

# =========================================================
# EXTRACT SECONDARY EMOTIONS
# =========================================================
def get_secondary_emotions(emotion_probabilities, primary_emotion, threshold=0.25):
    secondary = []

    for emotion, prob in emotion_probabilities.items():
        if emotion != primary_emotion and prob >= threshold:
            secondary.append({
                "emotion": emotion,
                "confidence": round(prob, 4)
            })

    secondary.sort(key=lambda x: x["confidence"], reverse=True)
    return secondary

# =========================================================
# MAIN FUNCTION
# =========================================================
def predict_sentiment_and_emotion(text):
    if not isinstance(text, str):
        raise ValueError("Input text must be a string.")

    cleaned_text = text.strip()

    if not cleaned_text:
        raise ValueError("Input text cannot be empty.")

    sentiment_label, sentiment_confidence, sentiment_probs = predict_with_model(
        text=cleaned_text,
        tokenizer=sentiment_tokenizer,
        model=sentiment_model,
        id2label=sentiment_id2label
    )

    emotion_label, emotion_confidence, emotion_probs = predict_with_model(
        text=cleaned_text,
        tokenizer=emotion_tokenizer,
        model=emotion_model,
        id2label=emotion_id2label
    )

    secondary_emotions = get_secondary_emotions(
        emotion_probabilities=emotion_probs,
        primary_emotion=emotion_label,
        threshold=0.15
    )

    return {
        "text": cleaned_text,
        "sentiment": sentiment_label,
        "sentiment_confidence": round(sentiment_confidence, 4),
        "emotion": emotion_label,
        "emotion_confidence": round(emotion_confidence, 4),
        "secondary_emotions": secondary_emotions,
        "sentiment_probabilities": sentiment_probs,
        "emotion_probabilities": emotion_probs
    }

# =========================================================
# LOCAL TEST
# =========================================================
if __name__ == "__main__":
    test_texts = [
        "This movie was amazing and I loved every minute of it.",
        "The film was boring and a complete waste of time.",
        "I really enjoyed this movie.",
        "This was one of the worst films I have ever seen.",
        "The acting was fantastic but the story was weak."
    ]

    for text in test_texts:
        result = predict_sentiment_and_emotion(text)
        print("=" * 100)
        print(result)
        print()