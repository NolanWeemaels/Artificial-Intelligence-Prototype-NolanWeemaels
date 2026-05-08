require("dotenv").config();

const express = require("express");
const path = require("path");
const multer = require("multer");
const OpenAI = require("openai");

const app = express();

const PORT = 3000;

const upload = multer({ dest: "uploads/" });

// Zorgt ervoor dat we bestanden kunnen ontvangen

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Leest de API key uit het .env bestand

app.use(express.json());

// Laat de server JSON lezen

app.use(express.static(path.join(__dirname, "public")));

// Zorgt ervoor dat de public map zichtbaar wordt

app.post("/analyze", upload.single("image"), async (req, res) => {

  try {

    const context = req.body.context;

    // Haalt de context op van de gebruiker

    const prompt = `
    You are a design feedback assistant.

    The user uploaded a design with this context:
    "${context}"

    Give short feedback about:
    - hierarchy
    - composition

    Keep the feedback simple and clear.
    `;

    // Bouwt een simpele prompt op

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    // Stuurt de prompt naar OpenAI

    const feedback = response.choices[0].message.content;

    // Haalt het antwoord op

    res.json({
      feedback: `<p>${feedback}</p>`
    });

    // Stuurt feedback terug naar de frontend

  } catch (error) {

    console.log(error);

    // Toont fouten in de terminal

    res.status(500).json({
      feedback: "<p>Something went wrong.</p>"
    });

  }

});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Start de server