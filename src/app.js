const form = document.getElementById("image-form");
const promptInput = document.getElementById("prompt");
const status = document.getElementById("status");
const resultImage = document.getElementById("result-image");
const generateButton = document.getElementById("generate-btn");
const configuredBaseUrl =
  window.APP_CONFIG && typeof window.APP_CONFIG.apiBaseUrl === "string"
    ? window.APP_CONFIG.apiBaseUrl.trim()
    : "";
const apiBaseUrl = configuredBaseUrl.replace(/\/+$/, "");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const prompt = promptInput.value.trim();
  if (!prompt) {
    status.textContent = "Please enter a prompt.";
    return;
  }

  status.textContent = "Generating image. This can take a few seconds...";
  generateButton.disabled = true;

  try {
    const response = await fetch(`${apiBaseUrl}/api/generate-image`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Image generation failed.");
    }

    resultImage.src = data.imageUrl;
    status.textContent = "Image generated.";
  } catch (error) {
    status.textContent = error.message || "Something went wrong.";
  } finally {
    generateButton.disabled = false;
  }
});
