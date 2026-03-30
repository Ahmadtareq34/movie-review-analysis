from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from inference import predict_sentiment_and_emotion

app = FastAPI(
    title="Movie Review Sentiment and Emotion Analysis API",
    description="API for predicting sentiment and emotion from movie review text using fine-tuned BERT models.",
    version="1.0.0"
)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

class ReviewInput(BaseModel):
    text: str

@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={}
    )

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict")
def predict(review: ReviewInput):
    try:
        return predict_sentiment_and_emotion(review.text)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.on_event("startup")
def startup_event():
    print("App started successfully")