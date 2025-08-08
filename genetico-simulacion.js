document.addEventListener("DOMContentLoaded", function () {
  const N = 10;
  const L = 12;
  const GENS = 3;
  let generation = 1;
  let population = [];
  let bestIndividual = null;
  let history = [];
  let currentPhase = '';

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

  function renderPopulation(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    data.forEach((genotype, i) => {
      const score = fitness(genotype);
      const color = getColor(score);
      const div = document.createElement("div");
      div.className = `font-mono text-xs px-2 py-1 rounded ${color} text-black text-center shadow`;
      const bitString = genotype.join('');
      let subtitle = "";

      if (options.phase === 'cruce' && options.parents) {
        subtitle = `<br><span class="text-[10px] text-gray-700">P${options.parents[i]}</span>`;
      }

      if (options.phase === 'mutacion' && options.mutatedBit && options.mutatedBit[i] !== undefined) {
        const pos = options.mutatedBit[i];
        let gCopy = [...genotype];
        gCopy[pos] = `<span class="text-red-600 font-bold">${gCopy[pos]}</span>`;
        div.innerHTML = `${gCopy.join('')}${subtitle}`;
        div.title = `Bit mutado en posición ${pos}`;
      } else {
        div.innerHTML = `${bitString}${subtitle}`;
        div.title = `Fitness: ${score}`;
      }

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

  function showExplanation(text, phase = "") {
    const e = document.getElementById('explanation');
    e.className = 'text-[18px] text-center font-semibold rounded shadow p-3 transition-colors duration-500 ease-in-out';

    const colors = {
      inicio: 'bg-blue-500 text-black',
      evaluacion: 'bg-indigo-500 text-black',
      seleccion: 'bg-yellow-500 text-black',
      cruce: 'bg-purple-500 text-black',
      mutacion: 'bg-pink-500 text-black',
      fin: 'bg-green-500 text-black',
      default: 'bg-gray-100 text-gray-800'
    };

    const color = colors[phase] || colors.default;
    e.classList.add(...color.split(' '));
    e.textContent = text;
  }

  function updateContainerColor(phase) {
    const colors = {
      inicio: 'bg-blue-100',
      evaluacion: 'bg-indigo-100',
      seleccion: 'bg-yellow-100',
      cruce: 'bg-purple-100',
      mutacion: 'bg-pink-100',
      fin: 'bg-green-100'
    };
    const popInit = document.getElementById('popInit');
    const popNew = document.getElementById('popNew');
    const all = [popInit, popNew];
    const color = colors[phase] || 'bg-white';
    all.forEach(el => {
      el.className = el.className.replace(/bg-\w+-100/g, '').trim();
      el.classList.add(color);
    });
  }

  function highlightConcept(phase) {
    const conceptMap = {
      inicio: 'concept-genotipo',
      evaluacion: 'concept-aptitud',
      seleccion: 'concept-seleccion',
      cruce: 'concept-cruce',
      mutacion: 'concept-mutacion',
      fin: 'concept-elitismo'
    };
    const highlightColor = {
      seleccion: 'bg-yellow-100',
      cruce: 'bg-purple-100',
      mutacion: 'bg-pink-100',
      evaluacion: 'bg-indigo-100',
      inicio: 'bg-blue-100',
      fin: 'bg-green-100'
    };

    document.querySelectorAll('#conceptList li').forEach(item => {
      item.classList.remove('bg-yellow-100', 'bg-purple-100', 'bg-pink-100', 'bg-green-100', 'bg-indigo-100', 'bg-blue-100');
    });

    const id = conceptMap[phase];
    if (id) document.getElementById(id)?.classList.add(highlightColor[phase]);
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

  async function wait(ms = 2000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function runOneGeneration() {
    showExplanation(`📘 Generación ${generation}: creando población inicial.`, 'inicio');
    updateContainerColor('inicio');
    highlightConcept('inicio');
    if (generation === 1) population = Array.from({ length: N }, randomGenotype);
    renderPopulation('popInit', population);
    await wait();

    showExplanation("📊 Evaluación: se calcula la aptitud de cada individuo.", 'evaluacion');
    updateContainerColor('evaluacion');
    highlightConcept('evaluacion');
    updateTable(population);
    await wait();

    showExplanation("✅ Selección: se eligen los mejores individuos.", 'seleccion');
    updateContainerColor('seleccion');
    highlightConcept('seleccion');
    const selected = population.sort((a, b) => fitness(b) - fitness(a)).slice(0, N / 2);
    await wait();

    showExplanation("🔀 Cruce: se combinan padres para generar hijos.", 'cruce');
    updateContainerColor('cruce');
    highlightConcept('cruce');
    const offspring = [];
    const parentRefs = [];
    for (let i = 0; i < selected.length - 1; i += 2) {
      const p1 = selected[i];
      const p2 = selected[i + 1];
      const point = Math.floor(L / 2);
      offspring.push([...p1.slice(0, point), ...p2.slice(point)]);
      offspring.push([...p2.slice(0, point), ...p1.slice(point)]);
      parentRefs.push(i + 1, i + 2);
    }
    renderPopulation('popNew', offspring, { phase: 'cruce', parents: parentRefs });
    await wait();

    showExplanation("⚡ Mutación: se altera aleatoriamente un bit.", 'mutacion');
    updateContainerColor('mutacion');
    highlightConcept('mutacion');
    const mutated = offspring.map((g, i) => {
      const copy = [...g];
      const shouldMutate = Math.random() < 0.5;
      if (shouldMutate) {
        const pos = Math.floor(Math.random() * L);
        copy[pos] = copy[pos] === '1' ? '0' : '1';
        return { genotype: copy, mutated: pos };
      }
      return { genotype: copy };
    });
    const mutatedGenotypes = mutated.map(m => m.genotype);
    const mutatedBits = mutated.map(m => m.mutated ?? null);
    renderPopulation('popNew', mutatedGenotypes, { phase: 'mutacion', mutatedBit: mutatedBits });
    await wait();

    const all = [...population, ...mutatedGenotypes];
    const best = all.reduce((a, b) => fitness(a) > fitness(b) ? a : b);
    if (!bestIndividual || fitness(best) > fitness(bestIndividual)) {
      bestIndividual = [...best];
      showBest(bestIndividual);
    }

    population = [...selected, ...mutatedGenotypes];
    updateTable(population);
    generation++;
  }

  async function runSimulation() {
    for (let i = 0; i < GENS; i++) await runOneGeneration();
    showExplanation("🎯 Optimización completada. Observa la mejor combinación encontrada.", 'fin');
    updateContainerColor('fin');
    highlightConcept('fin');
  }

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

    document.getElementById('startBtn').disabled = false;
  }

  document.getElementById('startBtn').addEventListener('click', () => {
    document.getElementById('startBtn').disabled = true;
    runSimulation();
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    resetSimulation();
  });
});
