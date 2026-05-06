const express = require("express");

const path = require("path");

const app = express();

const PORT = 3000;

// Zorgt ervoor dat de public map zichtbaar wordt in de browser

app.use(express.static(path.join(__dirname, "public")));

// Start de server

app.listen(PORT, () => {

  console.log(`Server running on http://localhost:${PORT}`);

});