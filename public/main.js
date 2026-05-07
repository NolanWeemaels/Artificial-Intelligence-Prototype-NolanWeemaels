const analyzeBtn = document.getElementById("analyzeBtn");
const result = document.getElementById("result");

analyzeBtn.addEventListener("click", async () => {

  const response = await fetch("/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      test: "hello"
    })
  });

  // Stuurt een request naar de server

  const data = await response.json();

  // Zet de response om naar JSON

  result.innerHTML = data.feedback;

  // Toont feedback op de pagina

});