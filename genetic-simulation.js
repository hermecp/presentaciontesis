function getRandomParam(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

const defaultSteps = [
  { title: "1. Inicialización", desc: "Combinaciones aleatorias:", data: [], color: "purple" },
  { title: "2. Evaluación", desc: "Cálculo de coherencia:", data: [], color: "blue" },
  { title: "3. Selección", desc: "Individuos con mejor puntuación.", data: [], color: "green" },
  { title: "4. Cruce", desc: "Se generan nuevos hijos.", data: [], color: "yellow" },
  { title: "5. Mutación", desc: "Variación aleatoria de genes.", data: [], color: "red" },
  { title: "6. Iteración", desc: "Proceso repetido por múltiples generaciones.", data: [], color: "indigo" }
];

function renderSteps(steps) {
  const output = document.getElementById('output');
  output.innerHTML = '';
  steps.forEach(step => {
    const div = document.createElement('div');
    div.className = `bg-${step.color}-50 border-l-4 border-${step.color}-400 p-4 shadow rounded`;
    div.innerHTML = `
      <h3 class="font-semibold text-${step.color}-800 mb-2">${step.title}</h3>
      <p>${step.desc}</p>
      <ul class="mt-2 list-disc pl-5 text-xs text-gray-700">${step.data.map(d => `<li>${d}</li>`).join("")}</ul>`;
    output.appendChild(div);
  });
}

async function runGeneticSimulation() {
  const generations = parseInt(document.getElementById('genSlider').value);
  const finalResult = document.getElementById('finalResult');
  document.getElementById('chart').innerHTML = '';
  finalResult.classList.add('hidden');

  const traceBefore20 = {
    x: [], y: [],
    mode: 'lines+markers',
    name: 'Etapa evolutiva',
    marker: { color: 'blue', size: 6 },
    line: { shape: 'spline', color: 'blue' }
  };

  const traceAfter20 = {
    x: [], y: [],
    mode: 'lines+markers',
    name: 'Convergencia',
    marker: { color: 'green', size: 6 },
    line: { shape: 'spline', color: 'green' }
  };

  const layout = {
    title: 'Convergencia del Algoritmo Genético',
    xaxis: { title: 'Generación' },
    yaxis: { title: 'Aptitud Máxima', range: [0.59, 0.67] },
    shapes: [],
    annotations: []
  };

  Plotly.newPlot('chart', [traceBefore20, traceAfter20], layout);

  for (let i = 0; i < generations; i++) {
    let y;
    if (i < 2) y = parseFloat((0.59 + i * 0.015).toFixed(3));
    else if (i < 10) y = 0.64;
    else if (i < 18) y = 0.655;
    else y = 0.666;

    if (i < 20) {
      traceBefore20.x.push(i + 1);
      traceBefore20.y.push(y);
    } else {
      traceAfter20.x.push(i + 1);
      traceAfter20.y.push(y);
    }

    Plotly.update('chart', {
      x: [traceBefore20.x, traceAfter20.x],
      y: [traceBefore20.y, traceAfter20.y]
    });

    if (i === 19) {
      Plotly.relayout('chart', {
        shapes: [{
          type: 'line',
          x0: 20, x1: 20,
          y0: 0.59, y1: 0.67,
          line: { color: 'gray', width: 2, dash: 'dot' }
        }],
        annotations: [{
          x: 20, y: 0.665,
          xref: 'x', yref: 'y',
          text: 'Inicio de convergencia',
          showarrow: true,
          arrowhead: 6,
          ax: 40,
          ay: -40
        }]
      });
    }

    defaultSteps[0].data = [
      `A: α=${getRandomParam(0.1, 0.9)}, β=${getRandomParam(0.01, 0.1)}, k=${Math.floor(Math.random() * 15 + 10)}`,
      `B: α=${getRandomParam(0.1, 0.9)}, β=${getRandomParam(0.01, 0.1)}, k=${Math.floor(Math.random() * 15 + 10)}`
    ];
    defaultSteps[1].data = [`Generación ${i + 1}: Coherencia = ${y}`];
    defaultSteps[2].data = [`Individuos seleccionados: ${Math.random() > 0.5 ? "A y B" : "B y C"}`];
    defaultSteps[3].data = [
      `Hijo1 α=${getRandomParam(0.2, 0.5)}, β=${getRandomParam(0.03, 0.07)}, k=${Math.floor(Math.random() * 10 + 15)}`
    ];
    defaultSteps[4].data = [`Mutación: k=${Math.floor(Math.random() * 5 + 18)} → ${Math.floor(Math.random() * 5 + 18)}`];
    defaultSteps[5].data = [`Iteración ${i + 1} completada.`];

    renderSteps(defaultSteps);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const finalAlpha = getRandomParam(0.2, 0.4);
  const finalBeta = getRandomParam(0.03, 0.07);
  const finalK = Math.floor(Math.random() * 5 + 18);
  const finalCoh = getRandomParam(0.85, 0.95, 3);

  finalResult.classList.remove('hidden');
  finalResult.innerHTML = `
    <h3 class="font-semibold text-green-900 mb-2">✅ Resultado Final</h3>
    <p>α = <code>${finalAlpha}</code>, β = <code>${finalBeta}</code>, k = <code>${finalK}</code>, Coherencia = <code>${finalCoh}</code></p>
    <p class="mt-2 text-sm italic text-gray-700">(Modelo final LDA optimizado)</p>`;
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM cargado. Simulación lista.");
  renderSteps(defaultSteps);

  const btn = document.getElementById("runBtn");
  if (btn) {
    btn.addEventListener("click", runGeneticSimulation);
  }
});
