/* Módulo Asignaciones — Dashboard resumen */

(() => {
  const LS_RUTAS = "prot-gdr-rutas-programadas";
  const LS_TECNICOS = "prot-gdr-tecnicos";
  const PAGE_SIZE = 6;

  let rutas = [];
  let tecnicos = [];
  let filtered = [];
  let page = 1;

  // DOM
  const tblBody = document.getElementById("tblBody");
  const paginationEl = document.getElementById("pagination");
  const cardsResumen = document.getElementById("cardsResumen");
  const searchBox = document.getElementById("searchBox");
  const filterEstado = document.getElementById("filterEstado");
  const countLabel = document.getElementById("countLabel");
  const btnExportCSV = document.getElementById("btnExportCSV");
  const btnActualizar = document.getElementById("btnActualizar");

  const modalDetalles = new bootstrap.Modal(document.getElementById("modalDetalles"));
  const modalBodyDetalles = document.getElementById("modalBodyDetalles");

  // Load data
  function load() {
    rutas = JSON.parse(localStorage.getItem(LS_RUTAS) || "[]");
    tecnicos = JSON.parse(localStorage.getItem(LS_TECNICOS) || "[]");
  }

  // Render Estado
  function badgeEstado(e) {
    if (e === "Pendiente") return `<span class="badge bg-secondary">Pendiente</span>`;
    if (e === "En_ejecucion") return `<span class="badge bg-warning text-dark">En ejecución</span>`;
    return `<span class="badge bg-success">Completada</span>`;
  }

  // Filter + Sort
  function applyFilters() {
    const q = searchBox.value.toLowerCase();
    const f = filterEstado.value;

    filtered = rutas.filter(r => {
      if (f !== "all" && r.estado !== f) return false;
      return (
        r.tecnico.toLowerCase().includes(q) ||
        r.medidores.toLowerCase().includes(q)
      );
    });
  }

  // Render Cards (resumen)
  function renderCards() {
    const tot = rutas.length;
    const pendientes = rutas.filter(r=>r.estado==="Pendiente").length;
    const ejecucion = rutas.filter(r=>r.estado==="En_ejecucion").length;
    const completadas = rutas.filter(r=>r.estado==="Completada").length;

    cardsResumen.innerHTML = `
      <div class="col-md-3">
        <div class="card card-hover shadow-sm">
          <div class="card-body">
            <h5 class="fw-bold">Total rutas</h5>
            <p class="fs-4">${tot}</p>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card card-hover shadow-sm">
          <div class="card-body">
            <h5 class="fw-bold text-secondary">Pendientes</h5>
            <p class="fs-4">${pendientes}</p>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card card-hover shadow-sm">
          <div class="card-body">
            <h5 class="fw-bold text-warning">En ejecución</h5>
            <p class="fs-4">${ejecucion}</p>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="card card-hover shadow-sm">
          <div class="card-body">
            <h5 class="fw-bold text-success">Completadas</h5>
            <p class="fs-4">${completadas}</p>
          </div>
        </div>
      </div>
    `;
  }

  // Render Table
  function renderTable() {
    applyFilters();
    renderCards();

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (page > totalPages) page = totalPages;

    const start = (page - 1) * PAGE_SIZE;
    const rows = filtered.slice(start, start + PAGE_SIZE);

    tblBody.innerHTML = rows.map(r => `
      <tr>
        <td>${r.id}</td>
        <td>${r.tecnico}</td>
        <td>${r.medidores}</td>
        <td>${r.fecha}</td>
        <td>${badgeEstado(r.estado)}</td>
        <td>
          <button class="btn btn-sm btn-outline-info" data-detalles="${r.id}">
            Ver técnico
          </button>
        </td>
      </tr>
    `).join("");

    renderPagination(totalPages);
    attachEvents();

    countLabel.textContent = filtered.length;
  }

  // Pagination
  function renderPagination(total) {
    paginationEl.innerHTML = "";

    for (let i = 1; i <= total; i++) {
      paginationEl.innerHTML += `
        <li class="page-item ${i===page?"active":""}">
          <a class="page-link" href="#" data-p="${i}">${i}</a>
        </li>`;
    }

    paginationEl.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", ev => {
        ev.preventDefault();
        page = Number(a.dataset.p);
        renderTable();
      });
    });
  }

  // Events inside table
  function attachEvents() {
    document.querySelectorAll("[data-detalles]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.detalles);
        const ruta = rutas.find(r => r.id === id);
        const tecnico = tecnicos.find(t => t.nombre + " " + t.apellido === ruta.tecnico);

        modalBodyDetalles.innerHTML = `
          <p><strong>Técnico:</strong> ${ruta.tecnico}</p>
          <p><strong>Medidores:</strong> ${ruta.medidores}</p>
          <p><strong>Fecha:</strong> ${ruta.fecha}</p>
          <p><strong>Estado:</strong> ${ruta.estado}</p>
          <hr>
          <h6>Datos del técnico:</h6>
          <p><strong>Zona asignada:</strong> ${tecnico?.zona_asignada ?? "No disponible"}</p>
          <p><strong>Estado técnico:</strong> ${tecnico?.estado ?? "No disponible"}</p>
        `;
        modalDetalles.show();
      });
    });
  }

  // Export CSV
  btnExportCSV.addEventListener("click", () => {
    if (rutas.length === 0) return alert("Sin datos para exportar");
    let csv = "id,tecnico,medidores,fecha,estado\n";
    rutas.forEach(r => {
      csv += `${r.id},${r.tecnico},${r.medidores},${r.fecha},${r.estado}\n`;
    });

    const blob = new Blob([csv],{type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "asignaciones.csv";
    a.click();
  });

  // Search & Filter
  searchBox.addEventListener("input", () => renderTable());
  filterEstado.addEventListener("change", () => renderTable());
  btnActualizar.addEventListener("click", () => {
    load();
    renderTable();
  });

  // Init
  load();
  renderTable();

})();
