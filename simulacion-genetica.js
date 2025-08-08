const N = 10;
const L = 12;
const GENS = 3;
let generation = 1;
let population = [];
let bestIndividual = null;
let history = [];

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
  if (score > 0.8) return 'bg-green-200 text-green-800';
  if (score > 0.6) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

function renderPopulation(containerId, data) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  data.forEach((genotype) => {
    const score = fitness(genotype);
    const color = getColor(score);
    const div = document.createElement("div");
    div.className = `font-mono text-xs px-2 py-1 rounded ${color} text-center shadow-sm`;
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
      <td class="border px-2 py-1">${i + 1}</td>
      <td class="border px-2 py-1 font-mono text-emerald-700">${genotype.join('')}</td>
      <td class="border px-2 py-1">
        <div class="h-2 bg-gray-300 rounded overflow-hidden mb-1">
          <div style="width: ${apt * 100}%" class="h-full bg-lime-500"></div>
        </div>
        <div class="text-xs text-gray-600">${apt}</div>
      </td>
      <td class="border px-2 py-1 text-sm">α: ${decoded.alpha}, β: ${decoded.beta}, topics: ${decoded.topics}</td>
    `;
    tbody.appendChild(tr);
  });
}

function showExplanation(text) {
  const e = document.getElementById('explanation');
  e.classList.remove('hidden');
  e.innerHTML = text;
}

function showBest(individual) {
  const params = decode(individual);
  const score = fitness(individual);
  history.push(score);
  document.getElementById('bestDisplay').innerHTML = `
    🏆 Mejor individuo: <span class="bg-black px-2 py-1 rounded text-lime-400">${individual.join('')}</span><br>
    <span class="text-sm">Coherencia: <b>${score}</b> | α=${params.alpha}, β=${params.beta}, topics=${params.topics}</span><br>
    <span class="text-xs text-gray-400">Historial: ${history.join(', ')}</span>
  `;
}

async function wait(ms = 1800) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runOneGeneration() {
  showExplanation(`📘 Generación ${generation}: creando población...`);
  if (generation === 1) population = Array.from({ length: N }, randomGenotype);
  renderPopulation('popInit', population);
  updateTable(population);
  await wait();

  showExplanation("✅ Selección de los mejores.");
  const selected = population.sort((a, b) => fitness(b) - fitness(a)).slice(0, N / 2);
  await wait();

  showExplanation("🔀 Cruzamiento.");
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

  showExplanation("⚡ Mutación.");
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
  showExplanation("🎯 Optimización completada.");
}

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startBtn');
  const resetBtn = document.getElementById('resetBtn');

  startBtn.addEventListener('click', () => {
    startBtn.disabled = true;
    runSimulation();
  });

  resetBtn.addEventListener('click', () => {
    generation = 1;
    population = [];
    bestIndividual = null;
    history = [];
    document.getElementById('popInit').innerHTML = "";
    document.getElementById('popNew').innerHTML = "";
    document.getElementById('genotypeTable').innerHTML = "";
    document.getElementById('bestDisplay').innerHTML = "";
    document.getElementById('explanation').textContent = "⏳ Esperando inicio...";
    startBtn.disabled = false;
  });
});
