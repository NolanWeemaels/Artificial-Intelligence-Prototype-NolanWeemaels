const analyzeBtn = document.getElementById("analyzeBtn");
const imageInput = document.getElementById("imageInput");
const contextInput = document.getElementById("contextInput");
const result = document.getElementById("result");
const imagePreview = document.getElementById("imagePreview");
const componentList = document.getElementById("componentList");
const overlay = document.getElementById("overlay");
const designTypeInput = document.getElementById("designType");

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
  overlay.innerHTML = "";

  // Maakt oude detecties leeg

});

analyzeBtn.addEventListener("click", async () => {

  const file = imageInput.files[0];
  const context = contextInput.value;
  const designType = designTypeInput.value;

  // Haalt afbeelding, context en type ontwerp op

  if (!file) {

    result.innerHTML = "<p>Please upload a design first.</p>";

    return;

  }

  // Controleert of een afbeelding geselecteerd is

  const formData = new FormData();

  formData.append("image", file);
  formData.append("context", context);
  formData.append("designType", designType);

  // Zet data klaar voor de server

  result.innerHTML = "<p>Analyzing design...</p>";
  componentList.innerHTML = "";
  overlay.innerHTML = "";

  // Toont laadmelding en maakt oude detecties leeg

  const response = await fetch("/analyze", {
    method: "POST",
    body: formData
  });

  // Stuurt afbeelding, context en type ontwerp naar server

  const data = await response.json();

  // Zet response om naar JSON

  console.log(data);

  // Toont serverantwoord in console voor debugging

  if (data.components) {

    data.components.forEach((component) => {

      const badge = document.createElement("span");

      badge.classList.add("component-badge");
      badge.classList.add("badge-" + component.type);

      badge.textContent = component.label;

      componentList.appendChild(badge);

      const box = document.createElement("div");

      box.classList.add("overlay-box");
      box.classList.add("overlay-" + component.type);

      box.textContent = component.label;

      // Geeft elke overlay box een kleur op basis van het component type

      box.style.left = (component.x || 5) + "%";
      box.style.top = (component.y || 5) + "%";
      box.style.width = (component.width || 30) + "%";
      box.style.height = (component.height || 10) + "%";

      overlay.appendChild(box);

    });

  }

  // Toont badges en tekent overlay boxes op de afbeelding

  result.innerHTML = data.feedback;

  // Toont feedback op de pagina

});