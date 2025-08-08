document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ DOM cargado. Simulación lista.");

  const N = 10;
  const L = 12;
  const GENS = 3;
  let generation = 1;
  let population = [];  
  let bestIndividual = null;
  let history = [];

  // === FUNCIONES BASE ===

  function randomGenotype() {
    return Array.from({ length: L }, () => Math.random() < 0.5 ? '0' : '1');
  }

  function decode(genotype) {
    const binToFloat = (bin, min, max) => {
      const decimal = parseInt(bin.join(''), 2) / 15;
      return (min + decimal * (max - min)).toFixed(2);
    };
    const alpha = binToFloat(genotype.slice(0, 4), 0.01, 1);
    const beta = binToFloat(genotype.slice(4, 8), 0.01, 1);
    const topics = Math.round(binToFloat(genotype.slice(8, 12), 2, 50));
    return { alpha, beta, topics };
  }

  function fitness(genotype) {
    const { alpha, beta, topics } = decode(genotype);
    const score = 1 - Math.abs(0.3 - alpha) - Math.abs(0.3 - beta) - Math.abs(20 - topics) / 50;
    return +(score.toFixed(2));
  }

  function getColor(score) {
    if (score > 0.8) return 'bg-green-300';
    if (score > 0.6) return 'bg-yellow-300';
    return 'bg-red-300';
  }

  // === ACTUALIZAR VISUALIZACIÓN ===

  function renderPopulation(containerId, data) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    data.forEach((genotype) => {
      const score = fitness(genotype);
      const color = getColor(score);
      const div = document.createElement("div");
      div.className = `font-mono text-xs px-2 py-1 rounded ${color} text-black text-center shadow`;
      div.textContent = genotype.join('');
      container.appendChild(div);
    });
  }

  function updateTable(data) {
    const tbody = document.getElementById("genotypeTable");
    tbody.innerHTML = "";
    data.forEach((genotype, i) => {
      const apt = fitness(genotype);
      const decoded = decode(genotype);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="border p-2">${i + 1}</td>
        <td class="border p-2 font-mono">${genotype.join('')}</td>
        <td class="border p-2">
          <div class="h-2 bg-gray-300 rounded overflow-hidden">
            <div style="width: ${apt * 100}%" class="h-full bg-green-500"></div>
          </div>
          <div class="text-xs">${apt}</div>
        </td>
        <td class="border p-2">α: ${decoded.alpha}, β: ${decoded.beta}, topics: ${decoded.topics}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // === COLORES DE FASES ===

  function showExplanation(text, phase = "") {
    const e = document.getElementById('explanation');
    e.classList.remove(
      'bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500',
      'bg-green-500', 'bg-gray-100', 'text-gray-800', 'text-white', 'text-black'
    );

    let color = 'bg-gray-100 text-gray-800';
    switch (phase) {
      case 'inicio': color = 'bg-blue-500 text-white'; break;
      case 'seleccion': color = 'bg-yellow-500 text-black'; break;
      case 'cruce': color = 'bg-purple-500 text-white'; break;
      case 'mutacion': color = 'bg-pink-500 text-black'; break;
      case 'fin': color = 'bg-green-500 text-white'; break;
    }

    color.split(' ').forEach(c => e.classList.add(c));
    e.textContent = text;
  }

  function updateContainerColor(phase) {
    const popInit = document.getElementById('popInit');
    const popNew = document.getElementById('popNew');
    const all = [popInit, popNew];

    const phaseColors = {
      inicio: 'bg-blue-100',
      seleccion: 'bg-yellow-100',
      cruce: 'bg-purple-100',
      mutacion: 'bg-pink-100',
      fin: 'bg-green-100',
      default: 'bg-white'
    };

    const color = phaseColors[phase] || phaseColors.default;

    all.forEach(el => {
      el.classList.remove(
        'bg-blue-100', 'bg-yellow-100', 'bg-purple-100', 'bg-pink-100', 'bg-green-100', 'bg-white'
      );
      el.classList.add(color);
    });
  }

  function highlightConcept(phase) {
    const conceptMap = {
      inicio: null,
      seleccion: 'concept-seleccion',
      cruce: 'concept-cruce',
      mutacion: 'concept-mutacion',
      fin: 'concept-elitismo'
    };

    const highlightColor = {
      seleccion: 'bg-yellow-100',
      cruce: 'bg-purple-100',
      mutacion: 'bg-pink-100',
      fin: 'bg-green-100'
    };

    const items = document.querySelectorAll('#conceptList li');
    items.forEach(item => {
      item.classList.remove('bg-yellow-100', 'bg-purple-100', 'bg-pink-100', 'bg-green-100');
    });

    const conceptId = conceptMap[phase];
    if (!conceptId) return;
    const item = document.getElementById(conceptId);
    if (item) item.classList.add(highlightColor[phase]);
  }

  function showBest(individual) {
    const params = decode(individual);
    const score = fitness(individual);
    history.push(score);
    document.getElementById('bestDisplay').innerHTML = `
      🏆 <b>Mejor individuo</b>: <span class="bg-black px-2 py-1 rounded text-lime-500">${individual.join('')}</span><br>
      Coherencia: <b>${score}</b> | α=${params.alpha}, β=${params.beta}, topics=${params.topics}<br>
      <span class="text-sm text-gray-500">Historial: ${history.join(', ')}</span>
    `;
  }

  async function wait(ms = 1800) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // === SIMULACIÓN ===

  async function runOneGeneration() {
    showExplanation(`📘 Generación ${generation}: creando población...`, 'inicio');
    updateContainerColor('inicio');
    highlightConcept('inicio');
    if (generation === 1) population = Array.from({ length: N }, randomGenotype);
    renderPopulation('popInit', population);
    updateTable(population);
    await wait();

    showExplanation("✅ Selección de los mejores individuos.", 'seleccion');
    updateContainerColor('seleccion');
    highlightConcept('seleccion');
    const selected = population.sort((a, b) => fitness(b) - fitness(a)).slice(0, N / 2);
    await wait();

    showExplanation("🔀 Cruzamiento de pares.", 'cruce');
    updateContainerColor('cruce');
    highlightConcept('cruce');
    const offspring = [];
    for (let i = 0; i < selected.length - 1; i += 2) {
      const p1 = selected[i];
      const p2 = selected[i + 1];
      const point = Math.floor(L / 2);
      offspring.push([...p1.slice(0, point), ...p2.slice(point)]);
      offspring.push([...p2.slice(0, point), ...p1.slice(point)]);
    }
    renderPopulation('popNew', offspring);
    await wait();

    showExplanation("⚡ Aplicando mutación.", 'mutacion');
    updateContainerColor('mutacion');
    highlightConcept('mutacion');
    const mutated = offspring.map(g => {
      const copy = [...g];
      if (Math.random() < 0.5) {
        const pos = Math.floor(Math.random() * L);
        copy[pos] = copy[pos] === '1' ? '0' : '1';
      }
      return copy;
    });
    renderPopulation('popNew', mutated);
    await wait();

    const all = [...population, ...mutated];
    const best = all.reduce((a, b) => fitness(a) > fitness(b) ? a : b);
    if (!bestIndividual || fitness(best) > fitness(bestIndividual)) {
      bestIndividual = [...best];
      showBest(bestIndividual);
    }

    population = [...selected, ...mutated];
    updateTable(population);
    generation++;
  }

  async function runSimulation() {
    for (let i = 0; i < GENS; i++) await runOneGeneration();
    showExplanation("🎯 Optimización completada. Observa la mejor combinación encontrada.", 'fin');
    updateContainerColor('fin');
    highlightConcept('fin');
  }

  // === REINICIO ===

  function resetSimulation() {
    generation = 1;
    population = [];
    bestIndividual = null;
    history = [];

    document.getElementById('popInit').innerHTML = '';
    document.getElementById('popNew').innerHTML = '';
    document.getElementById('genotypeTable').innerHTML = '';
    document.getElementById('bestDisplay').innerHTML = '';
    showExplanation("⏳ Esperando inicio...", '');
    updateContainerColor('');
    highlightConcept('');

    const startBtn = document.getElementById('startBtn');
    if (startBtn) startBtn.disabled = false;
  }

  // === BOTONES ===

  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      startBtn.disabled = true;
      runSimulation();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetSimulation();
    });
  }
});
