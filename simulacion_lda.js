const alphaInput = document.getElementById("alpha");
const betaInput = document.getElementById("beta");
const topicsInput = document.getElementById("topics");

const wordPool = [
  ["presupuesto", "finanzas", "recurso", "asignación", "monto"],
  ["viáticos", "comisión", "gastos", "viaje", "agenda"],
  ["plazas", "honorarios", "remuneración", "contrato", "salario"],
  ["documento", "folio", "expediente", "respuesta", "acceso"],
  ["proveedor", "licitación", "adjudicación", "compra", "contrato"],
  ["denuncia", "corrupción", "sanción", "falta", "queja"],
  ["proyecto", "ejecución", "avance", "meta", "evaluación"],
  ["tabulador", "puesto", "estructura", "categoría", "sueldo"],
  ["base de datos", "archivo", "pdf", "excel", "formato"],
  ["servicio", "salud", "educación", "programa", "desempeño"]
];

let attemptCounter = 0;

alphaInput.addEventListener("input", () => {
  document.getElementById("alphaVal").innerText = parseFloat(alphaInput.value).toFixed(2);
});
betaInput.addEventListener("input", () => {
  document.getElementById("betaVal").innerText = parseFloat(betaInput.value).toFixed(2);
});
topicsInput.addEventListener("input", () => {
  document.getElementById("topicsVal").innerText = parseInt(topicsInput.value);
});

function runSimulation() {
  attemptCounter++;

  const newAlpha = (Math.random() * 0.4 + 0.1).toFixed(2);
  const newBeta = (Math.random() * 0.2 + 0.01).toFixed(2);
  const newK = Math.floor(Math.random() * 6 + 3);

  alphaInput.value = newAlpha;
  betaInput.value = newBeta;
  topicsInput.value = newK;
  document.getElementById("alphaVal").innerText = newAlpha;
  document.getElementById("betaVal").innerText = newBeta;
  document.getElementById("topicsVal").innerText = newK;

  const stepsContainer = document.getElementById("steps");
  stepsContainer.innerHTML = "";
  for (let i = 1; i <= 6; i++) {
    const val = (Math.random() * 0.2 + 0.12).toFixed(3);
    stepsContainer.innerHTML += `
      <div class="flex flex-col items-center">
        <div class="w-3 h-3 rounded-full bg-red-500"></div>
        <div class="text-[10px] mt-1 font-mono">${val}</div>
      </div>`;
  }

  let coherence;
  if (attemptCounter < 6) {
    coherence = (Math.random() * 0.2 + 0.1).toFixed(3);
  } else {
    coherence = Math.random() < 0.4 
      ? (Math.random() * 0.4 + 0.5).toFixed(3) 
      : (Math.random() * 0.2 + 0.1).toFixed(3);
  }

  const baseTime = 25;
  const topicFactor = newK * 3;
  const alphaPenalty = (1 / parseFloat(newAlpha)) * 5;
  const timeMinutes = (baseTime + topicFactor + alphaPenalty).toFixed(0);

  document.getElementById("alphaRes").innerText = newAlpha;
  document.getElementById("betaRes").innerText = newBeta;
  document.getElementById("kRes").innerText = newK;
  document.getElementById("coherenceRes").innerText = coherence;
  document.getElementById("timeRes").innerText = `≈ ${timeMinutes} min`;

  const title = document.getElementById("coherenceTitle");
  const coherenceVal = document.getElementById("coherenceRes");
  const interpretation = document.getElementById("interpretationText");

  if (parseFloat(coherence) > 0.5) {
    title.innerText = "✅ Resultado del Modelo: Coherencia Alta";
    title.classList.remove("text-red-700");
    title.classList.add("text-green-700");
    coherenceVal.classList.remove("text-red-600");
    coherenceVal.classList.add("text-green-700");
    interpretation.innerHTML = `El modelo logró agrupar de manera efectiva las solicitudes en tópicos bien definidos. Esta coherencia sugiere un preprocesamiento adecuado, una segmentación clara del lenguaje y un número apropiado de temas.`;
  } else {
    title.innerText = "⚠️ Resultado del Modelo: Coherencia Baja";
    title.classList.remove("text-green-700");
    title.classList.add("text-red-700");
    coherenceVal.classList.remove("text-green-700");
    coherenceVal.classList.add("text-red-600");
    interpretation.innerHTML = `El modelo intentó agrupar las solicitudes en temas comunes, pero la baja coherencia indica que los tópicos no están bien definidos.`;
  }

  const topicList = document.getElementById("topicList");
  topicList.innerHTML = "";
  const used = new Set();
  for (let i = 0; i < newK; i++) {
    let index;
    do {
      index = Math.floor(Math.random() * wordPool.length);
    } while (used.has(index));
    used.add(index);
    const selectedWords = wordPool[index].sort(() => 0.5 - Math.random()).slice(0, 4);
    const wordsWithProbs = selectedWords.map(w => `${w} (${(Math.random() * 0.1 + 0.02).toFixed(3)})`).join(", ");
    topicList.innerHTML += `<div><strong>Tópico ${i + 1}:</strong> <span class="text-red-800">${wordsWithProbs}</span></div>`;
  }

  document.getElementById("finalResult").classList.remove("hidden");
}
