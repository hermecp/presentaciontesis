function getRandomParam(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

const defaultSteps = [
  { title: "1. Inicialización", desc: "<strong>Combinaciones aleatorias:</strong>", data: [], color: "purple" },
  { title: "2. Evaluación", desc: "<strong>Cálculo de coherencia:</strong>", data: [], color: "blue" },
  { title: "3. Selección", desc: "<strong>Individuos con mejor puntuación.</strong>", data: [], color: "green" },
  { title: "4. Cruce", desc: "<strong>Se generan nuevos hijos.</strong>", data: [], color: "yellow" },
  { title: "5. Mutación", desc: "<strong>Variación aleatoria de genes.</strong>", data: [], color: "red" },
  { title: "6. Iteración", desc: "<strong>Proceso repetido por múltiples generaciones.</strong>", data: [], color: "indigo" }
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
  const finalResult = document.getElementById('finalResultGenetico');

  // Reinicia solo el gráfico, no borra el DOM
  Plotly.purge('chart');
  finalResult.classList.add('hidden');

  let bestAlpha = null;
  let bestBeta = null;
  let bestK = null;
  let bestCoh = 0;

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

    const alpha = getRandomParam(0.2, 0.4);
    const beta = getRandomParam(0.03, 0.07);
    const k = Math.floor(Math.random() * 10 + 15);

    if (y > bestCoh) {
      bestCoh = y;
      bestAlpha = alpha;
      bestBeta = beta;
      bestK = k;
    }

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
      `<span style="font-size: larger"><strong>A:</strong> α=${getRandomParam(0.1, 0.9)}, β=${getRandomParam(0.01, 0.1)}, k=${Math.floor(Math.random() * 15 + 10)}</span>`,
      `<span style="font-size: larger"><strong>B:</strong> α=${getRandomParam(0.1, 0.9)}, β=${getRandomParam(0.01, 0.1)}, k=${Math.floor(Math.random() * 15 + 10)}</span>`
    ];
    defaultSteps[1].data = [
      `<span style="font-size: larger"><strong>Generación ${i + 1}:</strong> Coherencia = ${y}</span>`
    ];
    defaultSteps[2].data = [
      `<span style="font-size: larger"><strong>Individuos seleccionados:</strong> ${Math.random() > 0.5 ? "A y B" : "B y C"}</span>`
    ];
    defaultSteps[3].data = [
      `<span style="font-size: larger"><strong>Hijo1:</strong> α=${getRandomParam(0.2, 0.5)}, β=${getRandomParam(0.03, 0.07)}, k=${Math.floor(Math.random() * 10 + 15)}</span>`
    ];
    defaultSteps[4].data = [
      `<span style="font-size: larger"><strong>Mutación:</strong> k=${Math.floor(Math.random() * 5 + 18)} → ${Math.floor(Math.random() * 5 + 18)}</span>`
    ];
    defaultSteps[5].data = [
      `<span style="font-size: larger"><strong>Iteración ${i + 1} completada.</strong></span>`
    ];

    renderSteps(defaultSteps);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Espera breve antes de mostrar el resultado
  await new Promise(resolve => setTimeout(resolve, 400));

  finalResult.classList.remove('hidden');
  finalResult.classList.add('md:w-[400px]', 'w-full');
  finalResult.innerHTML = `
    <div class="text-sm text-gray-800 animate-fade-in">
      <h3 class="text-base font-semibold text-black-800 mb-1">✅ Resultado Final</h3>
      <p>
        α = <code class="text-black-700 font-bold">${bestAlpha}</code><br>
        β = <code class="text-black-700 font-bold">${bestBeta}</code><br>
        k = <code class="text-black-700 font-bold">${bestK}</code><br>
        Coherencia = <code class="text-black-700 font-bold">${bestCoh}</code>
      </p>
      <p class="mt-1 text-xs italic text-black-600">(Modelo final LDA optimizado)</p>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  renderSteps(defaultSteps);

  const btn = document.getElementById("runBtn");
  const slider = document.getElementById("genSlider");
  const valueDisplay = document.getElementById("genValue");

  if (btn) btn.addEventListener("click", runGeneticSimulation);
  if (slider && valueDisplay) {
    slider.addEventListener("input", () => {
      valueDisplay.textContent = slider.value;
    });
  }
});
