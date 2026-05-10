const analyzeBtn = document.getElementById("analyzeBtn");
const imageInput = document.getElementById("imageInput");
const contextInput = document.getElementById("contextInput");
const result = document.getElementById("result");
const imagePreview = document.getElementById("imagePreview");
const componentList = document.getElementById("componentList");

imageInput.addEventListener("change", () => {

  const file = imageInput.files[0];

  // Haalt de geselecteerde afbeelding op

  if (!file) return;

  // Stopt als er geen afbeelding is

  imagePreview.src = URL.createObjectURL(file);

  // Maakt een tijdelijke preview URL

  imagePreview.style.display = "block";

  // Toont de preview afbeelding

  componentList.innerHTML = "";

  // Maakt oude badges leeg

});

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

  // Zet data klaar voor de server

  result.innerHTML = "<p>Analyzing design...</p>";
  componentList.innerHTML = "";

  // Toont laadmelding en maakt oude badges leeg

  const response = await fetch("/analyze", {
    method: "POST",
    body: formData
  });

  // Stuurt afbeelding + context naar server

  const data = await response.json();

  // Zet response om naar JSON

  console.log(data);

  // Toont serverantwoord in console

  if (data.components) {

    data.components.forEach((component) => {

      const badge = document.createElement("span");

      badge.classList.add("component-badge");
      badge.classList.add("badge-" + component.type);

      badge.textContent = component.label;

      componentList.appendChild(badge);

    });

  }

  // Toont badges voor de gevonden UI componenten

  result.innerHTML = data.feedback;

  // Toont feedback op de pagina

});