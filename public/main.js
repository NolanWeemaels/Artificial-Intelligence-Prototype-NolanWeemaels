const imageInput = document.getElementById("imageInput");

const contextInput = document.getElementById("contextInput");

const file = imageInput.files[0];

const context = contextInput.value;

// Haalt afbeelding en context op zoals in de les (input verzamelen)

const formData = new FormData();

formData.append("image", file);

formData.append("context", context);

// Maakt een request body zoals bij API calls in de les

const response = await fetch("/analyze", {

  method: "POST",

  body: formData

});

// Stuurt data naar server

const data = await response.json();

result.innerHTML = data.feedback;

// Toont feedback op de pagina