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
                Analyze this design.

                Context:
                ${context}

                Detect:
                - Title
                - Subtitle
                - Main image
                - Body text

                Then give feedback in this exact HTML structure:

                <h3>Detected Elements</h3>
                <ul>
                <li><strong>Title:</strong> ...</li>
                <li><strong>Subtitle:</strong> ...</li>
                <li><strong>Main Image:</strong> ...</li>
                <li><strong>Body Text:</strong> ...</li>
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

                Keep the feedback short and simple.
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
      feedback: `<p>${feedback}</p>`
    });

    // Stuurt feedback terug naar frontend

  } catch (error) {

    console.log(error);

    // Toont fouten in de terminal

    res.status(500).json({
      feedback: "<p>Something went wrong while analyzing the design.</p>"
    });

  }

});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Start de server