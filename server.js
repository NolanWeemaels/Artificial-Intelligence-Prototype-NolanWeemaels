require("dotenv").config();

const express = require("express");
const path = require("path");
const multer = require("multer");
const OpenAI = require("openai");
const fs = require("fs");

const app = express();

const PORT = 3000;

const upload = multer({ dest: "uploads/" });

// Zorgt ervoor dat we bestanden kunnen uploaden

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Leest de OpenAI API key uit .env

app.use(express.json());

// Laat Express JSON lezen

app.use(express.static(path.join(__dirname, "public")));

// Maakt de public map zichtbaar

app.post("/analyze", upload.single("image"), async (req, res) => {

  try {

    const context = req.body.context;
    const designType = req.body.designType;

    // Haalt context en type ontwerp op

    const imagePath = req.file.path;

    // Haalt het pad van de afbeelding op

    const base64Image = fs.readFileSync(imagePath, {
      encoding: "base64"
    });

    // Zet afbeelding om naar base64

    const designGuidelines = fs.readFileSync(
      "./design_regels_ui_ux_analyse.txt",
      "utf8"
    );

    // Leest de RAG knowledge file in

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

Design type:
${designType}

This means you should give feedback specifically for this type of design.

Return ONLY valid JSON.
Do not use markdown.
Do not use code blocks.

Context:
${context}

Design guidelines from RAG:
${designGuidelines}

Detect visible UI elements:
- title
- subtitle
- buttons
- navigation
- images
- text blocks
- cards
- footer

Every component must include:
- type
- label
- x
- y
- width
- height

Use percentages from 0 to 100.

The overlay positions must closely match the real position of the UI element in the image.

x = distance from the left
y = distance from the top
width = width of the detected area
height = height of the detected area

Be critical and specific in the feedback.

Return this exact JSON structure:

{
  "components": [
    {
      "type": "title",
      "label": "Main title",
      "x": 30,
      "y": 20,
      "width": 40,
      "height": 10
    }
  ],

  "feedback": "
    <h3>Detected Elements</h3>

    <ul>
      <li>...</li>
    </ul>

    <h3>Hierarchy Feedback</h3>
    <p>...</p>

    <h3>Composition Feedback</h3>
    <p>...</p>

    <h3>Suggestions</h3>

    <ul>
      <li>...</li>
    </ul>
  "
}
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

    // Stuurt afbeelding + context + RAG naar OpenAI

    const content = response.choices[0].message.content;

    // Haalt AI antwoord op

    const parsedResponse = JSON.parse(content);

    // Zet AI antwoord om naar JSON

    res.json(parsedResponse);

    // Stuurt resultaat terug naar frontend

  } catch (error) {

    console.log(error);

    // Toont fouten in terminal

    res.status(500).json({
      feedback: "<p>Something went wrong while analyzing the design.</p>"
    });

  }

});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Start de server