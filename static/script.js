const analyzeBtn = document.getElementById("analyzeBtn");
const reviewText = document.getElementById("reviewText");
const errorMessage = document.getElementById("errorMessage");
const resultSection = document.getElementById("resultSection");

const sentimentBadge = document.getElementById("sentimentBadge");
const sentimentConfidence = document.getElementById("sentimentConfidence");

const emotionBadge = document.getElementById("emotionBadge");
const emotionConfidence = document.getElementById("emotionConfidence");

const secondaryEmotions = document.getElementById("secondaryEmotions");
const noSecondaryEmotion = document.getElementById("noSecondaryEmotion");

const submittedText = document.getElementById("submittedText");

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

analyzeBtn.addEventListener("click", async () => {
    const text = reviewText.value.trim();

    errorMessage.textContent = "";
    resultSection.classList.add("hidden");
    secondaryEmotions.innerHTML = "";
    noSecondaryEmotion.classList.add("hidden");

    if (!text) {
        errorMessage.textContent = "Please enter a movie review before analyzing.";
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
            errorMessage.textContent = data.detail || "Something went wrong.";
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
        errorMessage.textContent = "Unable to connect to the server.";
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "Analyze Review";
    }
});