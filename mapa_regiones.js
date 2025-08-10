// --------- Config ---------
const GEOJSON_URL = "https://raw.githubusercontent.com/angelnmara/geojson/master/mexicoHigh.json";

const REGIONS = {
  "Noroeste": ["Baja California","Baja California Sur","Chihuahua","Durango","Sinaloa","Sonora"],
  "Noreste": ["Coahuila","Coahuila de Zaragoza","Nuevo León","Tamaulipas"],
  "Occidente": ["Colima","Jalisco","Michoacán","Michoacán de Ocampo","Nayarit"],
  "Oriente": ["Hidalgo","Puebla","Tlaxcala","Veracruz","Veracruz de Ignacio de la Llave"],
  "Centronorte": ["Aguascalientes","Guanajuato","Querétaro","Querétaro de Arteaga","San Luis Potosí","Zacatecas"],
  "Centrosur": ["Ciudad de México","Distrito Federal","México","Morelos"],
  "Suroeste": ["Chiapas","Guerrero","Oaxaca"],
  "Sureste": ["Campeche","Quintana Roo","Tabasco","Yucatán"]
};

const TOPICS_INFO = {
  "Noroeste":"572 tópicos","Noreste":"312 tópicos","Occidente":"391 tópicos","Oriente":"425 tópicos",
  "Centronorte":"485 tópicos","Centrosur":"1158 tópicos","Suroeste":"285 tópicos","Sureste":"386 tópicos"
};

const COLORS = {
  "Noroeste":"#2f7d6d","Noreste":"#1f7aa5","Occidente":"#d0b215","Oriente":"#b5b7bd",
  "Centronorte":"#8aa35a","Centrosur":"#9a6bd3","Suroeste":"#d57a1c","Sureste":"#283560"
};

// --------- Util ---------
const normalize = s => (s||"").toLowerCase()
  .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
  .replace(/\./g,"").replace(/\s+/g," ").trim();

const stateToRegion = {};
Object.entries(REGIONS).forEach(([r, list]) => list.forEach(n => stateToRegion[normalize(n)] = r));

// --------- Mapa ---------
const mapEl = document.getElementById("map");
const slide = mapEl.closest(".slide");
const header = slide.querySelector(".slide-header");
const footer = slide.querySelector(".slide-footer");
const content = slide.querySelector(".slide-content");

// Función para que el mapa use TODO el alto disponible en el slide
function resizeMapHeight(){
  const vh = window.innerHeight;
  const used = header.offsetHeight + footer.offsetHeight
             + parseFloat(getComputedStyle(content).paddingTop)
             + parseFloat(getComputedStyle(content).paddingBottom);
  // margen de seguridad 12px
  const h = Math.max(520, vh - used - 12);
  mapEl.style.height = h + "px";
  if (map) { map.invalidateSize(); if (mxBounds) map.fitBounds(mxBounds, {padding:[10,10]}); }
}

// Crear mapa
const map = L.map("map", { zoomControl:false, preferCanvas:true });
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom:9, attribution:"© OpenStreetMap" }).addTo(map);

let geojson, mxBounds;

fetch(GEOJSON_URL).then(r=>r.json()).then(data=>{
  geojson = L.geoJSON(data, {
    style: f => {
      const reg = stateToRegion[normalize(f.properties.name)];
      return { color:"#fff", weight:1, fillColor: COLORS[reg] || "#ccc", fillOpacity:.9 };
    },
    onEachFeature:(f, layer)=>{
      const raw = f.properties?.name || f.properties?.NOM_ENT || "";
      const reg = stateToRegion[normalize(raw)] || "Sin región";
      layer.bindPopup(`<strong>${raw}</strong><br>${reg}`);
    }
  }).addTo(map);

  mxBounds = geojson.getBounds();
  resizeMapHeight();          // calcula altura y encuadre inicial
  addLegend();
});

// Leyenda
function addLegend(){
  const legend = L.control({position:"bottomleft"});
  legend.onAdd = function(){
    const div = L.DomUtil.create("div","legend");
    div.innerHTML = `<h4>Regiones · Tópicos</h4>` + Object.keys(REGIONS).map(k =>
      `<div><span class="sw" style="background:${COLORS[k]}"></span><strong>${k}</strong> — ${TOPICS_INFO[k]}</div>`
    ).join("");
    return div;
  };
  legend.addTo(map);
}

// Recalcular al cambiar tamaño, entrar en fullscreen, o mover el slide
window.addEventListener("load", resizeMapHeight);
window.addEventListener("resize", resizeMapHeight);
new ResizeObserver(resizeMapHeight).observe(content);
