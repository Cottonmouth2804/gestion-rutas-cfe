/* js/tecnicos.js
   Prototipo: almacenamiento en localStorage, UI dinámica y acciones simuladas.
   Key localStorage: "prot-gdr-tecnicos"
*/

(() => {
  // Config
  const LS_KEY = "prot-gdr-tecnicos";
  const PAGE_SIZE = 6; // filas por página

  // Estado
  let tecnicos = [];
  let filtered = [];
  let page = 1;

  // DOM
  const tblBody = document.getElementById("tblBody");
  const countLabel = document.getElementById("countLabel");
  const paginationEl = document.getElementById("pagination");
  const searchInput = document.getElementById("searchInput");
  const filterStatus = document.getElementById("filterStatus");
  const sortBy = document.getElementById("sortBy");
  const btnAdd = document.getElementById("btnAdd");
  const btnImportSample = document.getElementById("btnImportSample");
  const btnExportCSV = document.getElementById("btnExportCSV");

  const modalForm = new bootstrap.Modal(document.getElementById("modalForm"));
  const formTecnico = document.getElementById("formTecnico");
  const modalTitle = document.getElementById("modalTitle");
  const inputId = document.getElementById("inputId");
  const inputNombre = document.getElementById("inputNombre");
  const inputApellido = document.getElementById("inputApellido");
  const inputZona = document.getElementById("inputZona");
  const inputEstado = document.getElementById("inputEstado");


  // -------- Helpers --------
  function saveToLS() {
    localStorage.setItem(LS_KEY, JSON.stringify(tecnicos));
  }

  function loadFromLS() {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        tecnicos = JSON.parse(raw);
      } catch (e) {
        tecnicos = [];
      }
    } else {
      tecnicos = [];
    }
  }

  function uid() {
    return Date.now() + Math.floor(Math.random() * 999);
  }

  function formatEstado(e) {
    if (e === "Disponible") return '<span class="badge bg-success status-badge">Disponible</span>';
    if (e === "En_ruta") return '<span class="badge bg-warning text-dark status-badge">En ruta</span>';
    return '<span class="badge bg-secondary status-badge">Inactivo</span>';
  }

  // -------- Render --------
  function applyFiltersAndSort() {
    const q = searchInput.value.trim().toLowerCase();
    const status = filterStatus.value;
    const sort = sortBy.value;

    filtered = tecnicos.filter(t => {
      if (status !== "all" && t.estado !== status) return false;
      if (!q) return true;
      return (
        (t.nombre || "").toLowerCase().includes(q) ||
        (t.apellido || "").toLowerCase().includes(q) ||
        (String(t.zona_asignada || "")).toLowerCase().includes(q)
      );
    });

    if (sort === "nombre") {
      filtered.sort((a,b) => (a.nombre || "").localeCompare(b.nombre || ""));
    } else if (sort === "estado") {
      filtered.sort((a,b) => (a.estado || "").localeCompare(b.estado || ""));
    } else if (sort === "zona_asignada") {
      filtered.sort((a,b) => String(a.zona_asignada || "").localeCompare(String(b.zona_asignada || "")));
    } else {
      filtered.sort((a,b) => a.id_tecnico - b.id_tecnico);
    }
  }

  function renderTable() {
    applyFiltersAndSort();
    const total = filtered.length;
    countLabel.textContent = total;

    // pagination
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > totalPages) page = totalPages;

    const start = (page - 1) * PAGE_SIZE;
    const slice = filtered.slice(start, start + PAGE_SIZE);

    tblBody.innerHTML = slice.map(t => `
      <tr>
        <td>${t.id_tecnico}</td>
        <td>${escapeHtml(t.nombre)}</td>
        <td>${escapeHtml(t.apellido)}</td>
        <td>${escapeHtml(t.zona_asignada || '')}</td>
        <td>${formatEstado(t.estado)}</td>
        <td>
          <div class="btn-group" role="group">
            <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${t.id_tecnico}">Editar</button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${t.id_tecnico}">Eliminar</button>
            <button class="btn btn-sm btn-outline-secondary" data-action="toggle" data-id="${t.id_tecnico}">Cambiar estado</button>
          </div>
        </td>
      </tr>
    `).join("");

    renderPagination(totalPages);
    attachRowEvents();
  }

  function renderPagination(totalPages) {
    paginationEl.innerHTML = "";
    const createLi = (i, label = null, active = false, disabled = false) => {
      const li = document.createElement("li");
      li.className = "page-item" + (active ? " active" : "") + (disabled ? " disabled" : "");
      const a = document.createElement("a");
      a.className = "page-link";
      a.href = "#";
      a.dataset.p = i;
      a.textContent = label ?? i;
      li.appendChild(a);
      return li;
    };

    // prev
    paginationEl.appendChild(createLi(Math.max(1, page-1), "«", false, page===1));

    // pages (show up to 5)
    const windowSize = 5;
    let start = Math.max(1, page - Math.floor(windowSize/2));
    let end = Math.min(totalPages, start + windowSize -1);
    if (end - start < windowSize -1) start = Math.max(1, end - windowSize +1);

    for (let i = start; i<=end; i++) {
      paginationEl.appendChild(createLi(i, null, i===page));
    }

    // next
    paginationEl.appendChild(createLi(Math.min(totalPages, page+1), "»", false, page===totalPages));

    // events
    Array.from(paginationEl.querySelectorAll("a.page-link")).forEach(a => {
      a.addEventListener("click", (ev) => {
        ev.preventDefault();
        const p = parseInt(a.dataset.p);
        if (!isNaN(p)) {
          page = p;
          renderTable();
        }
      });
    });
  }

  function attachRowEvents() {
    Array.from(tblBody.querySelectorAll("button")).forEach(btn => {
      const action = btn.dataset.action;
      const id = parseInt(btn.dataset.id);
      if (action === "edit") btn.addEventListener("click", () => openEdit(id));
      if (action === "delete") btn.addEventListener("click", () => removeTecnico(id));
      if (action === "toggle") btn.addEventListener("click", () => toggleEstado(id));
    });

    // status-badge clickable toggles estado (cuando se hace click directo en la badge)
    Array.from(tblBody.querySelectorAll(".status-badge")).forEach(el => {
      el.addEventListener("click", (ev) => {
        const tr = el.closest("tr");
        if (!tr) return;
        const id = parseInt(tr.children[0].textContent);
        toggleEstado(id);
      });
    });
  }

  // -------- CRUD simulados --------
  function addTecnico(payload) {
    const newT = Object.assign({},
      {
        id_tecnico: uid(),
        nombre: payload.nombre || "",
        apellido: payload.apellido || "",
        zona_asignada: payload.zona_asignada || "",
        estado: payload.estado || "Disponible",
        fecha_ultima_actividad: new Date().toISOString()
      });
    tecnicos.push(newT);
    saveToLS();
    renderTable();
  }

  function updateTecnico(id, payload) {
    const idx = tecnicos.findIndex(t => t.id_tecnico === id);
    if (idx === -1) return;
    tecnicos[idx] = Object.assign({}, tecnicos[idx], payload);
    saveToLS();
    renderTable();
  }

  function removeTecnico(id) {
    if (!confirm("¿Eliminar técnico? Esta acción es solo para la demo.")) return;
    tecnicos = tecnicos.filter(t => t.id_tecnico !== id);
    saveToLS();
    renderTable();
  }

  function toggleEstado(id) {
    const t = tecnicos.find(x => x.id_tecnico === id);
    if (!t) return;
    if (t.estado === "Disponible") t.estado = "En_ruta";
    else if (t.estado === "En_ruta") t.estado = "Inactivo";
    else t.estado = "Disponible";
    t.fecha_ultima_actividad = new Date().toISOString();
    saveToLS();
    renderTable();
  }

  // -------- UI: Edit / Add --------
  function openAdd() {
    inputId.value = "";
    inputNombre.value = "";
    inputApellido.value = "";
    inputZona.value = "";
    inputEstado.value = "Disponible";
    modalTitle.textContent = "Agregar Técnico";
    modalForm.show();
  }

  function openEdit(id) {
    const t = tecnicos.find(x => x.id_tecnico === id);
    if (!t) return alert("Técnico no encontrado");
    inputId.value = t.id_tecnico;
    inputNombre.value = t.nombre || "";
    inputApellido.value = t.apellido || "";
    inputZona.value = t.zona_asignada || "";
    inputEstado.value = t.estado || "Disponible";
    modalTitle.textContent = "Editar Técnico — ID " + t.id_tecnico;
    modalForm.show();
  }

  formTecnico.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const id = inputId.value ? parseInt(inputId.value) : null;
    const payload = {
      nombre: inputNombre.value.trim(),
      apellido: inputApellido.value.trim(),
      zona_asignada: inputZona.value.trim(),
      estado: inputEstado.value
    };
    if (!payload.nombre) return alert("Nombre requerido");
    if (id) {
      updateTecnico(id, payload);
    } else {
      addTecnico(payload);
    }
    modalForm.hide();
  });

  // -------- Sample / Export CSV --------
  function loadSample() {
    const sample = [
      { id_tecnico: uid(), nombre: "Juan", apellido: "Pérez", zona_asignada: "Centro", estado: "Disponible" },
      { id_tecnico: uid(), nombre: "Ana", apellido: "López", zona_asignada: "Norte", estado: "Disponible" },
      { id_tecnico: uid(), nombre: "Luis", apellido: "Martínez", zona_asignada: "Sur", estado: "En_ruta" },
      { id_tecnico: uid(), nombre: "María", apellido: "González", zona_asignada: "Oeste", estado: "Inactivo" },
      { id_tecnico: uid(), nombre: "Pedro", apellido: "Sánchez", zona_asignada: "Centro", estado: "Disponible" },
      { id_tecnico: uid(), nombre: "Laura", apellido: "Ríos", zona_asignada: "Norte", estado: "Disponible" },
      { id_tecnico: uid(), nombre: "Diego", apellido: "Vega", zona_asignada: "Este", estado: "Disponible" }
    ];
    tecnicos = tecnicos.concat(sample);
    saveToLS();
    page = 1;
    renderTable();
  }

  function exportCSV() {
    if (tecnicos.length === 0) return alert("No hay técnicos para exportar.");
    const rows = [
      ["id_tecnico","nombre","apellido","zona_asignada","estado","fecha_ultima_actividad"],
      ...tecnicos.map(t => [t.id_tecnico, t.nombre, t.apellido, t.zona_asignada, t.estado, t.fecha_ultima_actividad || ""])
    ];
    const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tecnicos_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // -------- Utility --------
  function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/[&<>"'`=\/]/g, function (s) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"':'&quot;', "'":'&#39;', '/':'&#x2F;', '`':'&#x60;', '=':'&#x3D;' })[s];
    });
  }

  // -------- Events --------
  btnAdd.addEventListener("click", openAdd);
  btnImportSample.addEventListener("click", () => {
    if (!confirm("Cargar datos de ejemplo? Los datos actuales se conservarán.")) return;
    loadSample();
  });
  btnExportCSV.addEventListener("click", exportCSV);

  searchInput.addEventListener("input", () => { page = 1; renderTable(); });
  filterStatus.addEventListener("change", () => { page = 1; renderTable(); });
  sortBy.addEventListener("change", () => { page = 1; renderTable(); });

  // Row actions (delegated not necessary due to attachRowEvents)
  function initialLoad() {
    loadFromLS();
    if (tecnicos.length === 0) {
      // opcional: dejar vacío o cargar sample automáticamente
      // loadSample();
    }
    renderTable();
  }

  // Inicio
  initialLoad();

})();
