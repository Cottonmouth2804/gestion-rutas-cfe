(() => {
  const LS_KEY = "prot-gdr-rutas-programadas";
  const PAGE_SIZE = 5;

  let rutas = [];
  let filtered = [];
  let page = 1;

  // DOM refs
  const tblBody = document.getElementById("tblBody");
  const paginationEl = document.getElementById("pagination");
  const searchBox = document.getElementById("searchBox");
  const filterEstado = document.getElementById("filterEstado");
  const sortBy = document.getElementById("sortBy");
  const btnNuevaRuta = document.getElementById("btnNuevaRuta");
  const btnSample = document.getElementById("btnSample");
  const btnExport = document.getElementById("btnExport");

  // Modal
  const modal = new bootstrap.Modal(document.getElementById("modalRuta"));
  const form = document.getElementById("formRuta");

  const inputId = document.getElementById("inputId");
  const inputTecnico = document.getElementById("inputTecnico");
  const inputMedidores = document.getElementById("inputMedidores");
  const inputFecha = document.getElementById("inputFecha");
  const inputEstado = document.getElementById("inputEstado");
  const modalTitle = document.getElementById("modalTitle");

  function uid() {
    return Date.now() + Math.floor(Math.random() * 999);
  }

  // Load / Save
  function load() {
    rutas = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  }

  function save() {
    localStorage.setItem(LS_KEY, JSON.stringify(rutas));
  }

  // Render
  function applyFilters() {
    const q = searchBox.value.toLowerCase();
    const f = filterEstado.value;
    const s = sortBy.value;

    filtered = rutas.filter(r => {
      if (f !== "all" && r.estado !== f) return false;
      return (
        r.tecnico.toLowerCase().includes(q) ||
        r.medidores.toLowerCase().includes(q)
      );
    });

    if (s === "tecnico") {
      filtered.sort((a,b) => a.tecnico.localeCompare(b.tecnico));
    } else if (s === "fecha") {
      filtered.sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
    } else if (s === "estado") {
      filtered.sort((a,b) => a.estado.localeCompare(b.estado));
    } else {
      filtered.sort((a,b) => a.id - b.id);
    }
  }

  function renderTable() {
    applyFilters();

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
        <td>${renderEstado(r.estado)}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" data-edit="${r.id}">Editar</button>
          <button class="btn btn-sm btn-outline-danger" data-del="${r.id}">Eliminar</button>
        </td>
      </tr>
    `).join("");

    renderPagination(totalPages);
    attachActions();
  }

  function renderEstado(e) {
    if (e === "Pendiente") return `<span class="badge bg-secondary">Pendiente</span>`;
    if (e === "En_ejecucion") return `<span class="badge bg-warning text-dark">En ejecución</span>`;
    return `<span class="badge bg-success">Completada</span>`;
  }

  function renderPagination(total) {
    paginationEl.innerHTML = "";
    for (let i = 1; i <= total; i++) {
      paginationEl.innerHTML += `
        <li class="page-item ${i===page?"active":""}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>`;
    }
    paginationEl.querySelectorAll("a").forEach(a=>{
      a.addEventListener("click", ev=>{
        ev.preventDefault();
        page = Number(a.dataset.page);
        renderTable();
      });
    });
  }

  // CRUD
  function openNew() {
    inputId.value = "";
    modalTitle.textContent = "Nueva Ruta";
    form.reset();
    modal.show();
  }

  function openEdit(id) {
    const r = rutas.find(x=>x.id===id);
    if (!r) return;

    modalTitle.textContent = "Editar Ruta";
    inputId.value = r.id;
    inputTecnico.value = r.tecnico;
    inputMedidores.value = r.medidores;
    inputFecha.value = r.fecha;
    inputEstado.value = r.estado;
    modal.show();
  }

  function addRuta(data) {
    rutas.push({
      id: uid(),
      ...data
    });
    save();
    renderTable();
  }

  function updateRuta(id, data) {
    const idx = rutas.findIndex(r=>r.id===id);
    if (idx>=0) {
      rutas[idx] = {...rutas[idx], ...data};
      save();
      renderTable();
    }
  }

  function deleteRuta(id) {
    if (!confirm("¿Eliminar ruta?")) return;
    rutas = rutas.filter(r=>r.id!==id);
    save();
    renderTable();
  }

  // Attach row actions
  function attachActions() {
    document.querySelectorAll("[data-edit]").forEach(b=>{
      b.addEventListener("click", ()=>openEdit(Number(b.dataset.edit)));
    });
    document.querySelectorAll("[data-del]").forEach(b=>{
      b.addEventListener("click", ()=>deleteRuta(Number(b.dataset.del)));
    });
  }

  // Sample Data
  btnSample.addEventListener("click", ()=>{
    const sample = [
      { id: uid(), tecnico: "Juan Pérez", medidores: "A-10293, B-22941", fecha:"2025-02-23", estado:"Pendiente"},
      { id: uid(), tecnico: "Ana López", medidores: "C-98123", fecha:"2025-02-24", estado:"En_ejecucion"},
      { id: uid(), tecnico: "Luis Martínez", medidores: "M-10011, M-10012", fecha:"2025-02-22", estado:"Completada"}
    ];
    rutas = rutas.concat(sample);
    save();
    renderTable();
  });

  // Export CSV
  btnExport.addEventListener("click", ()=>{
    if (rutas.length===0) return alert("Sin datos para exportar");
    let csv = "id,tecnico,medidores,fecha,estado\n";
    rutas.forEach(r=>{
      csv += `${r.id},${r.tecnico},${r.medidores},${r.fecha},${r.estado}\n`;
    });
    const blob = new Blob([csv],{type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rutas_programadas.csv";
    a.click();
  });

  // Form submit
  form.addEventListener("submit", ev=>{
    ev.preventDefault();

    const data = {
      tecnico: inputTecnico.value.trim(),
      medidores: inputMedidores.value.trim(),
      fecha: inputFecha.value,
      estado: inputEstado.value
    };

    const id = Number(inputId.value);

    if (id) updateRuta(id, data);
    else addRuta(data);

    modal.hide();
  });

  // Init
  load();
  renderTable();

  btnNuevaRuta.addEventListener("click", openNew);
  searchBox.addEventListener("input", ()=>renderTable());
  filterEstado.addEventListener("change", ()=>renderTable());
  sortBy.addEventListener("change", ()=>renderTable());

})();
