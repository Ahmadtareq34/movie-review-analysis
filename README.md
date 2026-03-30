# Movie Review Sentiment and Emotion Analysis API

This project is a BERT-based movie review analysis system that predicts both sentiment and emotion from movie review text.

## Features

- Sentiment classification
  - Positive
  - Negative

- Emotion classification
  - Sadness
  - Joy
  - Love
  - Anger
  - Fear
  - Surprise

- Web interface served by FastAPI
- REST API endpoint for prediction
- Health check endpoint

## Tech Stack

- Python
- FastAPI
- Hugging Face Transformers
- PyTorch
- Jinja2

## Project Structure

```text
Movie_Review_Analysis/
│
├── static/
├── templates/
├── inference.py
├── app.py
├── requirements.txt
├── .gitignore
└── README.md
```

## API Usage

### Health Check

**Endpoint**
GET /health

**Example response**

```json
{
  "status": "ok"
}
```

### Predict Sentiment and Emotion

**Endpoint**
POST /predict

**Request body**

```json
{
  "text": "This movie was amazing and I loved every minute of it."
}
```

**Example response**

```json
{
  "text": "This movie was amazing and I loved every minute of it.",
  "sentiment": "positive",
  "sentiment_confidence": 0.9981,
  "emotion": "joy",
  "emotion_confidence": 0.9624,
  "secondary_emotions": [
    {
      "emotion": "love",
      "confidence": 0.1542
    }
  ],
  "sentiment_probabilities": {
    "negative": 0.0019,
    "positive": 0.9981
  },
  "emotion_probabilities": {
    "sadness": 0.0121,
    "joy": 0.9624,
    "love": 0.1542,
    "anger": 0.0031,
    "fear": 0.0014,
    "surprise": 0.0068
  }
}
```

## Live Demo

Deployed application:  
https://movie-review-analysis-no3j.onrender.com

## Notes About Models

The fine-tuned BERT models are not stored in this repository due to their large size.

They are hosted on Hugging Face and loaded dynamically at runtime using environment variables:

- SENTIMENT_MODEL_PATH
- EMOTION_MODEL_PATH

## Run Locally

Start the application with:

py -m uvicorn app:app --host 0.0.0.0 --port 8000

Then open:

http://127.0.0.1:8000

## Endpoints Summary

- / → Frontend interface
- /health → Health check
- /predict → Sentiment and emotion prediction
