require("dotenv").config();

const express = require("express");
const path = require("path");
const multer = require("multer");
const OpenAI = require("openai");
const fs = require("fs");

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

    // Haalt context op van de gebruiker

    const imagePath = req.file.path;

    // Haalt het pad van de afbeelding op

    const base64Image = fs.readFileSync(imagePath, {
      encoding: "base64"
    });

    // Zet de afbeelding om naar base64

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
              Analyze this UI design. Do not wrap the response in markdown or code blocks.
              Also mention footer elements if visible.
              Be more critical and give specific feedback.

              Context:
              ${context}

              First detect the visible UI elements.

              Identify:
              - title
              - subtitle
              - buttons
              - navigation
              - images
              - text blocks
              - cards

              Then return the response in this exact HTML structure:

              <h3>Detected Elements</h3>
              <ul>
              <li><strong>Title:</strong> ...</li>
              <li><strong>Subtitle:</strong> ...</li>
              <li><strong>Buttons:</strong> ...</li>
              <li><strong>Navigation:</strong> ...</li>
              <li><strong>Images:</strong> ...</li>
              <li><strong>Text Blocks:</strong> ...</li>
              <li><strong>Cards:</strong> ...</li>
              </ul>

              <h3>Hierarchy Feedback</h3>
              <p>...</p>

              <h3>Composition Feedback</h3>
              <p>...</p>

              <h3>Suggestions</h3>
              <ul>
              <li>...</li>
              <li>...</li>
              </ul>

              Keep the feedback short and clear.
              `
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${base64Image}`
              }
            }
          ]
        }
      ]
    });

    // Stuurt afbeelding + context naar OpenAI

    const feedback = response.choices[0].message.content;

    // Haalt AI feedback op

    res.json({
      feedback: feedback
    });

    // Stuurt feedback terug naar frontend

  } catch (error) {
    console.log(error);

    // Toont fouten in de terminal

    res.status(500).json({
      feedback: "<p>Something went wrong while analyzing the design.</p>"
    });

    // Stuurt foutmelding terug naar frontend
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Start de server