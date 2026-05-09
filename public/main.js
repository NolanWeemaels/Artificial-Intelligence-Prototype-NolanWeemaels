const analyzeBtn = document.getElementById("analyzeBtn");
const imageInput = document.getElementById("imageInput");
const contextInput = document.getElementById("contextInput");
const result = document.getElementById("result");

analyzeBtn.addEventListener("click", async () => {

  const file = imageInput.files[0];
  const context = contextInput.value;

  // Haalt afbeelding en context op

  if (!file) {

    result.innerHTML = "<p>Please upload a PNG file.</p>";

    return;

  }

  // Controleert of een afbeelding geselecteerd is

  const formData = new FormData();

  formData.append("image", file);
  formData.append("context", context);

  // Zet de data klaar voor de server

  result.innerHTML = "<p>Analyzing design...</p>";

  // Tijdelijke laadmelding

  const response = await fetch("/analyze", {
    method: "POST",
    body: formData
  });

  // Stuurt afbeelding + context naar server

  const data = await response.json();

  // Zet response om naar JSON

  result.innerHTML = data.feedback;

  // Toont feedback op de pagina

});