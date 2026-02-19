import dotenv from "dotenv";
import express from "express";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in .env file.");
  process.exit(1);
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json({ limit: "1mb" }));
app.use(express.static("."));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});


app.post("/api/generate-image", async (req, res) => {
  try {
    const prompt = String(req.body?.prompt || "").trim();
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const imageResponse = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
    });

    const imageData = imageResponse.data?.[0];
    if (!imageData) {
      return res.status(502).json({ error: "No image returned by OpenAI." });
    }

    if (imageData.url) {
      return res.json({ imageUrl: imageData.url });
    }

    if (imageData.b64_json) {
      const imageUrl = `data:image/png;base64,${imageData.b64_json}`;
      return res.json({ imageUrl });
    }

    return res.status(502).json({ error: "Unsupported OpenAI image response format." });
  } catch (error) {
    const message = error?.error?.message || error?.message || "Failed to generate image.";
    return res.status(500).json({ error: message });
  }
});

app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}`);
});
