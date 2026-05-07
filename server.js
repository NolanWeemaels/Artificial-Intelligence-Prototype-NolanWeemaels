const express = require("express");
const path = require("path");

const app = express();

const PORT = 3000;

app.use(express.json());

// Zorgt ervoor dat we JSON data kunnen ontvangen

app.use(express.static(path.join(__dirname, "public")));

// Zorgt ervoor dat de public map zichtbaar wordt in de browser

app.post("/analyze", (req, res) => {

  res.json({
    feedback: `
      <p><strong>Hierarchy:</strong> The title is visible enough.</p>
      <p><strong>Composition:</strong> The layout feels balanced.</p>
    `
  });

});

// Stuurt tijdelijke test feedback terug

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

