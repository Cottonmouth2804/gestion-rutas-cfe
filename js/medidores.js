/* Módulo Medidores
   Interacción avanzada con localStorage
*/

(() => {
  const LS_KEY = "prot-gdr-medidores";
  const PAGE_SIZE = 6;

  let medidores = [];
  let filtered = [];
  let page = 1;

  // DOM
  const tblBody = document.getElementById("tblBody");
  const countLabel = document.getElementById("countLabel");
  const paginationEl = document.getElementById("pagination");

  const searchInput = document.getElementById("searchInput");
  const filterEstado = document.getElementById("filterEstado");
  const sortBy = document.getElementById("sortBy");

  const btnAdd = document.getElementById("btnAddMedidor");
  const btnImportSample = document.getElementById("btnImportSample");
  const btnExportCSV = document.getElementById("btnExportCSV");

  const modal = new bootstrap.Modal(document.getElementById("modalMedidor"));
  const formMedidor = document.getElementById("formMedidor");

  const inputId = document.getElementById("inputId");
  const inputNumero = document.getElementById("inputNumero");
  const inputDireccion = document.getElementById("inputDireccion");
  const inputEstado = document.getElementById("inputEstado");
  const modalTitle = document.getElementById("modalTitle");

  // ---------------- Helpers ----------------
  function saveLS() {
    localStorage.setItem(LS_KEY, JSON.stringify(medidores));
  }

  function loadLS() {
    medidores = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  }

  function uid() {
    return Date.now() + Math.floor(Math.random() * 999);
  }

  function estadoBadge(estado) {
    if (estado === "Activo") return `<span class="badge bg-success">Activo</span>`;
    if (estado === "En_revision") return `<span class="badge bg-warning text-dark">En revisión</span>`;
    return `<span class="badge bg-secondary">Inhabilitado</span>`;
  }

  // ---------------- Render ----------------
  function applyFilters() {
    const q = searchInput.value.trim().toLowerCase();
    const f = filterEstado.value;
    const sort = sortBy.value;

    filtered = medidores.filter(m => {
      if (f !== "all" && m.estado !== f) return false;
      if (!q) return true;
      return (
        String(m.numero).toLowerCase().includes(q) ||
        String(m.direccion).toLowerCase().includes(q)
      );
    });

    if (sort === "numero_medidor") {
      filtered.sort((a,b) => a.numero.localeCompare(b.numero));
    } else if (sort === "estado") {
      filtered.sort((a,b) => a.estado.localeCompare(b.estado));
    } else {
      filtered.sort((a,b) => a.id - b.id);
    }
  }

  function renderTable() {
    applyFilters();

    const total = filtered.length;
    countLabel.textContent = total;

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > totalPages) page = totalPages;

    const start = (page - 1) * PAGE_SIZE;
    const rows = filtered.slice(start, start + PAGE_SIZE);

    tblBody.innerHTML = rows.map(m => `
      <tr>
        <td>${m.id}</td>
        <td>${m.numero}</td>
        <td>${m.direccion}</td>
        <td>${estadoBadge(m.estado)}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${m.id}">Editar</button>
          <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${m.id}">Eliminar</button>
        </td>
      </tr>
    `).join("");

    renderPagination(totalPages);
    attachEvents();
  }

  function renderPagination(totalPages) {
    paginationEl.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
      paginationEl.innerHTML += `
        <li class="page-item ${i === page ? "active" : ""}">
          <a class="page-link" href="#" data-p="${i}">${i}</a>
        </li>
      `;
    }

    paginationEl.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", ev => {
        ev.preventDefault();
        page = Number(a.dataset.p);
        renderTable();
      });
    });
  }

  // ---------------- CRUD ----------------
  function openAdd() {
    inputId.value = "";
    modalTitle.textContent = "Agregar Medidor";
    formMedidor.reset();
    modal.show();
  }

  function openEdit(id) {
    const m = medidores.find(x => x.id === id);
    if (!m) return;

    modalTitle.textContent = "Editar Medidor";

    inputId.value = m.id;
    inputNumero.value = m.numero;
    inputDireccion.value = m.direccion;
    inputEstado.value = m.estado;

    modal.show();
  }

  function addMedidor(data) {
    medidores.push({
      id: uid(),
      numero: data.numero,
      direccion: data.direccion,
      estado: data.estado
    });

    saveLS();
    renderTable();
  }

  function updateMedidor(id, data) {
    const idx = medidores.findIndex(m => m.id === id);
    if (idx >= 0) {
      medidores[idx] = { ...medidores[idx], ...data };
      saveLS();
      renderTable();
    }
  }

  function deleteMedidor(id) {
    if (!confirm("¿Eliminar medidor? (solo demostración)")) return;
    medidores = medidores.filter(m => m.id !== id);
    saveLS();
    renderTable();
  }

  // ---------------- Eventos ----------------
  function attachEvents() {
    document.querySelectorAll("button[data-action]").forEach(btn => {
      const id = Number(btn.dataset.id);
      const action = btn.dataset.action;

      if (action === "edit") btn.addEventListener("click", () => openEdit(id));
      if (action === "delete") btn.addEventListener("click", () => deleteMedidor(id));
    });
  }

  btnAdd.addEventListener("click", openAdd);
  searchInput.addEventListener("input", () => renderTable());
  filterEstado.addEventListener("change", () => renderTable());
  sortBy.addEventListener("change", () => renderTable());

  // Importar muestra
  btnImportSample.addEventListener("click", () => {
    const sample = [
      { id: uid(), numero: "A-10293", direccion: "Calle Hidalgo 345", estado: "Activo" },
      { id: uid(), numero: "B-22941", direccion: "Av. Central 12", estado: "En_revision" },
      { id: uid(), numero: "C-98123", direccion: "Col. Centro #55", estado: "Inhabilitado" }
    ];
    medidores = medidores.concat(sample);
    saveLS();
    renderTable();
  });

  // Exportar CSV
  btnExportCSV.addEventListener("click", () => {
    if (medidores.length === 0) return alert("No hay datos para exportar.");

    let csv = "id,numero,direccion,estado\n";
    medidores.forEach(m => {
      csv += `${m.id},${m.numero},${m.direccion},${m.estado}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "medidores.csv";
    a.click();
  });

  // Guardar cambios del formulario
  formMedidor.addEventListener("submit", ev => {
    ev.preventDefault();

    const data = {
      numero: inputNumero.value.trim(),
      direccion: inputDireccion.value.trim(),
      estado: inputEstado.value
    };

    if (!data.numero) return alert("Número requerido");

    if (inputId.value) {
      updateMedidor(Number(inputId.value), data);
    } else {
      addMedidor(data);
    }

    modal.hide();
  });

  // ---------------- Init ----------------
  loadLS();
  renderTable();
})();
