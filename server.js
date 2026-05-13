require("dotenv").config();

const express = require("express");
const path = require("path");
const multer = require("multer");
const OpenAI = require("openai");
const fs = require("fs");

const app = express();
const PORT = 3000;

const upload = multer({ dest: "uploads/" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/analyze", upload.single("image"), async (req, res) => {

  try {

    const context = req.body.context || "";
    const designType = req.body.designType || "Design";

    const imagePath = req.file.path;

    const base64Image = fs.readFileSync(imagePath, {
      encoding: "base64"
    });

    const designGuidelines = fs.readFileSync(
      "./knowledge/design_regels_ui_ux_analyse.txt",
      "utf8"
    );

    const response = await openai.chat.completions.create({

      model: "gpt-4o-mini",

      response_format: {
        type: "json_object"
      },

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

Give feedback specifically for this type of design.

Context:
${context}

Design guidelines from RAG:
${designGuidelines}

Return ONLY valid JSON.

Detect visible UI elements:
- title
- subtitle
- buttons
- navigation
- images
- text
- cards
- footer

Every component must include:
- type
- label
- x
- y
- width
- height

Allowed component types:
title, subtitle, button, navigation, image, text, card, footer

Use percentages from 0 to 100 for x, y, width and height.

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
  "detectedElements": [
    "Main title",
    "Navigation",
    "Button"
  ],
  "hierarchyFeedback": "Short but specific feedback about hierarchy.",
  "compositionFeedback": "Short but specific feedback about composition.",
  "suggestions": [
    "First suggestion",
    "Second suggestion"
  ]
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

    const content = response.choices[0].message.content;

    const parsedResponse = JSON.parse(content);

    const detectedElementsHTML = parsedResponse.detectedElements
      .map((item) => `<li>${item}</li>`)
      .join("");

    const suggestionsHTML = parsedResponse.suggestions
      .map((item) => `<li>${item}</li>`)
      .join("");

    const feedbackHTML = `
      <h3>Detected Elements</h3>
      <ul>
        ${detectedElementsHTML}
      </ul>

      <h3>Hierarchy Feedback</h3>
      <p>${parsedResponse.hierarchyFeedback}</p>

      <h3>Composition Feedback</h3>
      <p>${parsedResponse.compositionFeedback}</p>

      <h3>Suggestions</h3>
      <ul>
        ${suggestionsHTML}
      </ul>
    `;

    res.json({
      components: parsedResponse.components || [],
      feedback: feedbackHTML
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      components: [],
      feedback: "<p>Something went wrong while analyzing the design.</p>"
    });

  }

});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});