from transformers import AutoModelForSequenceClassification, AutoTokenizer

SENTIMENT_MODEL_PATH = "./sentiment_model"

print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(SENTIMENT_MODEL_PATH)

print("Loading model...")
model = AutoModelForSequenceClassification.from_pretrained(SENTIMENT_MODEL_PATH)

print("\nModel config:")
print("num_labels:", model.config.num_labels)
print("id2label:", model.config.id2label)
print("label2id:", model.config.label2id)