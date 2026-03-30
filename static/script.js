const analyzeBtn = document.getElementById("analyzeBtn");
const reviewText = document.getElementById("reviewText");
const errorMessage = document.getElementById("errorMessage");
const resultSection = document.getElementById("resultSection");
const charCount = document.getElementById("charCount");

const sentimentBadge = document.getElementById("sentimentBadge");
const sentimentConfidence = document.getElementById("sentimentConfidence");

const emotionBadge = document.getElementById("emotionBadge");
const emotionConfidence = document.getElementById("emotionConfidence");

const secondaryEmotions = document.getElementById("secondaryEmotions");
const noSecondaryEmotion = document.getElementById("noSecondaryEmotion");

const submittedText = document.getElementById("submittedText");

const MIN_LENGTH = 10;
const MAX_LENGTH = 1000;

function getBadgeClass(label) {
    return `badge badge-${label.toLowerCase()}`;
}

function formatPercent(value) {
    return `${(value * 100).toFixed(2)}%`;
}

function toTitleCase(text) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function createSecondaryEmotionCard(label, confidence) {
    const card = document.createElement("div");
    card.className = "secondary-emotion-card";

    const badge = document.createElement("span");
    badge.className = getBadgeClass(label);
    badge.textContent = toTitleCase(label);

    const confidenceLine = document.createElement("p");
    confidenceLine.className = "confidence-line";
    confidenceLine.innerHTML = `Confidence: <span>${formatPercent(confidence)}</span>`;

    card.appendChild(badge);
    card.appendChild(confidenceLine);

    return card;
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
}

function clearError() {
    errorMessage.textContent = "";
    errorMessage.classList.add("hidden");
}

function updateCharCount() {
    const currentLength = reviewText.value.length;
    charCount.textContent = `${currentLength} / ${MAX_LENGTH} characters`;
}

function validateInput(text) {
    const trimmed = text.trim();

    if (!trimmed) {
        return "Please enter a movie review before analyzing.";
    }

    if (trimmed.length < MIN_LENGTH) {
        return `Please enter at least ${MIN_LENGTH} characters before analyzing.`;
    }

    if (trimmed.length > MAX_LENGTH) {
        return `Your review is too long. Please keep it under ${MAX_LENGTH} characters.`;
    }

    return null;
}

reviewText.addEventListener("input", () => {
    updateCharCount();
    clearError();
});

updateCharCount();

analyzeBtn.addEventListener("click", async () => {
    const text = reviewText.value.trim();

    clearError();
    resultSection.classList.add("hidden");
    secondaryEmotions.innerHTML = "";
    noSecondaryEmotion.classList.add("hidden");

    const validationError = validateInput(text);
    if (validationError) {
        showError(validationError);
        return;
    }

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing...";

    try {
        const response = await fetch("/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text })
        });

        const data = await response.json();

        if (!response.ok) {
            showError(data.detail || "Prediction failed. Please try again.");
            return;
        }

        sentimentBadge.className = getBadgeClass(data.sentiment);
        sentimentBadge.textContent = toTitleCase(data.sentiment);

        emotionBadge.className = getBadgeClass(data.emotion);
        emotionBadge.textContent = toTitleCase(data.emotion);

        sentimentConfidence.textContent = formatPercent(data.sentiment_confidence);
        emotionConfidence.textContent = formatPercent(data.emotion_confidence);
        submittedText.textContent = data.text;

        if (data.secondary_emotions && data.secondary_emotions.length > 0) {
            data.secondary_emotions.forEach(item => {
                const card = createSecondaryEmotionCard(item.emotion, item.confidence);
                secondaryEmotions.appendChild(card);
            });
        } else {
            noSecondaryEmotion.classList.remove("hidden");
        }

        resultSection.classList.remove("hidden");
    } catch (error) {
        showError("Unable to connect to the server right now. Please try again in a moment.");
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "Analyze Review";
    }
});