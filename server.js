require("dotenv").config();

const express = require("express");
const path = require("path");
const multer = require("multer");
const OpenAI = require("openai");
const fs = require("fs");

const app = express();
const PORT = 3000;

const upload = multer({ dest: "uploads/" });

// Zorgt ervoor dat afbeeldingen ontvangen worden

const knowledgeFiles = [
  "visual-hierarchy.txt",
  "composition.txt",
  "typography.txt",
  "color-contrast.txt",
  "spacing.txt"
];

// Bevat de RAG knowledge files

function getDesignGuidelines() {
  let guidelines = "";

  knowledgeFiles.forEach((fileName) => {
    const filePath = path.join(__dirname, "knowledge", fileName);
    const fileContent = fs.readFileSync(filePath, "utf8");

    guidelines += fileContent + "\n\n";
  });

  return guidelines;
}

// Leest de RAG bestanden uit

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Maakt de OpenAI client aan

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    const context = req.body.context;

    // Haalt de context op

    const designGuidelines = getDesignGuidelines();

    // Haalt de RAG regels op

    const imagePath = req.file.path;

    // Haalt het pad van de afbeelding op

    const base64Image = fs.readFileSync(imagePath, {
      encoding: "base64"
    });

    // Zet de afbeelding om naar base64

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
Analyze this UI design.

Return ONLY valid JSON.
Do not use markdown.
Do not use code blocks.

Context:
${context}

Design guidelines from RAG:
${designGuidelines}

Detect visible UI elements:
title, subtitle, buttons, navigation, images, text blocks, cards and footer.

Return this exact JSON structure:

{
  "components": [
    {
      "type": "title",
      "label": "Main title"
    }
  ],
  "feedback": "<h3>Detected Elements</h3><ul><li>...</li></ul><h3>Hierarchy Feedback</h3><p>...</p><h3>Composition Feedback</h3><p>...</p><h3>Suggestions</h3><ul><li>...</li></ul>"
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

    // Stuurt afbeelding, context en RAG naar OpenAI

    const aiResult = JSON.parse(response.choices[0].message.content);

    // Zet het AI antwoord om naar JSON

    res.json(aiResult);

    // Stuurt components en feedback naar frontend

  } catch (error) {
    console.log(error);

    res.status(500).json({
      components: [],
      feedback: "<p>Something went wrong while analyzing the design.</p>"
    });

    // Stuurt een foutmelding terug
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Start de server