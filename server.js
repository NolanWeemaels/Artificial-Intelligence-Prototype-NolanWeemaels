const express = require("express");
const path = require("path");
const multer = require("multer");

const app = express();

const PORT = 3000;

const upload = multer({ dest: "uploads/" });

// Zorgt ervoor dat we bestanden kunnen ontvangen

app.use(express.json());

// Nodig om JSON te lezen (zoals in de les)

app.use(express.static(path.join(__dirname, "public")));

// Zorgt ervoor dat je frontend werkt

app.post("/analyze", upload.single("image"), (req, res) => {

  const context = req.body.context;
  const file = req.file;

  // Haalt context en afbeelding op

  console.log("Context:", context);
  console.log("File:", file);

  // Checkt of data correct binnenkomt

  res.json({
    feedback: "<p>Image and context received successfully.</p>"
  });

  // Stuurt tijdelijke feedback terug

});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
