/* Módulo Reportes — Dashboard Visual */

(() => {
  const LS_RUTAS = "prot-gdr-rutas-programadas";
  const LS_TECNICOS = "prot-gdr-tecnicos";
  const LS_MEDIDORES = "prot-gdr-medidores";

  let rutas = [];
  let tecnicos = [];
  let medidores = [];

  // DOM
  const cardsResumen = document.getElementById("cardsResumen");
  const graficaEstados = document.getElementById("graficaEstados");
  const graficaTecnicos = document.getElementById("graficaTecnicos");
  const btnExportCSV = document.getElementById("btnExportCSV");

  // Load data
  function load() {
    rutas = JSON.parse(localStorage.getItem(LS_RUTAS) || "[]");
    tecnicos = JSON.parse(localStorage.getItem(LS_TECNICOS) || "[]");
    medidores = JSON.parse(localStorage.getItem(LS_MEDIDORES) || "[]");
  }

  // Render Cards
  function renderCards() {
    const tot = rutas.length;
    const pendientes = rutas.filter(r => r.estado === "Pendiente").length;
    const ejec = rutas.filter(r => r.estado === "En_ejecucion").length;
    const comp = rutas.filter(r => r.estado === "Completada").length;

    cardsResumen.innerHTML = `
      <div class="col-md-3">
        <div class="card shadow-sm card-hover">
          <div class="card-body text-center">
            <h5 class="text-secondary">Total Rutas</h5>
            <p class="fs-4">${tot}</p>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card shadow-sm card-hover">
          <div class="card-body text-center">
            <h5 class="text-warning">En ejecución</h5>
            <p class="fs-4">${ejec}</p>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card shadow-sm card-hover">
          <div class="card-body text-center">
            <h5 class="text-secondary">Pendientes</h5>
            <p class="fs-4">${pendientes}</p>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card shadow-sm card-hover">
          <div class="card-body text-center">
            <h5 class="text-success">Completadas</h5>
            <p class="fs-4">${comp}</p>
          </div>
        </div>
      </div>
    `;
  }

  // Barras simples
  function barra(label, value, max) {
    const width = max === 0 ? 0 : (value / max * 100);
    return `
      <div class="mb-2">
        <strong>${label}</strong>
        <div class="bar-container">
          <div class="bar-fill" style="width:${width}%"></div>
        </div>
        <small class="text-muted">${value} rutas</small>
      </div>
    `;
  }

  // Render gráfico de estados
  function renderGraficaEstados() {
    const totPend = rutas.filter(r=>r.estado==="Pendiente").length;
    const totEjec = rutas.filter(r=>r.estado==="En_ejecucion").length;
    const totComp = rutas.filter(r=>r.estado==="Completada").length;

    const max = Math.max(totPend, totEjec, totComp, 1);

    graficaEstados.innerHTML = `
      ${barra("Pendientes", totPend, max)}
      ${barra("En ejecución", totEjec, max)}
      ${barra("Completadas", totComp, max)}
    `;
  }

  // Render gráfico por técnico
  function renderGraficaTecnicos() {
    const conteo = {};

    rutas.forEach(r => {
      if (!conteo[r.tecnico]) conteo[r.tecnico] = 0;
      conteo[r.tecnico]++;
    });

    const valores = Object.values(conteo);
    const max = Math.max(...valores, 1);

    graficaTecnicos.innerHTML = Object.entries(conteo)
      .map(([tec, cant]) => barra(tec, cant, max))
      .join("");
  }

  // Export CSV
  btnExportCSV.addEventListener("click", () => {
    if (rutas.length === 0) return alert("No hay datos de rutas.");

    let csv = "id,tecnico,medidores,fecha,estado\n";

    rutas.forEach(r => {
      csv += `${r.id},${r.tecnico},${r.medidores},${r.fecha},${r.estado}\n`;
    });

    const blob = new Blob([csv], { type:"text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "reporte_rutas.csv";
    a.click();
  });

  // Init
  load();
  renderCards();
  renderGraficaEstados();
  renderGraficaTecnicos();

})();
