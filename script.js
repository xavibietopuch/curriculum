import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://ltlbdhwsihmsnjjjwxmi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bGJkaHdzaWhtc25qamp3eG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MjYzNjksImV4cCI6MjA3NDEwMjM2OX0.w9-ogm-lElU_Z62eURWzg61rzBPCDT0JEcLdgG6n0Vo";

const supabase = createClient(supabaseUrl, supabaseKey);

// Selects del formulario "Añadir"
const selectCategoria = document.getElementById("categoria");
const selectTrabajo = document.getElementById("trabajo");

// Selects de filtros en "Buscar"
const filtroCategoria = document.getElementById("filtro-categoria");
const filtroTrabajo = document.getElementById("filtro-trabajo");

// Array temporal para la tabla local
let tareasLocales = [];

/* ========== Navegación de secciones ========== */
function mostrarSeccion(id) {
  document.querySelectorAll(".seccion").forEach(sec => (sec.style.display = "none"));
  if (id) document.getElementById(id).style.display = "block";
}
window.mostrarSeccion = mostrarSeccion;

/* ========== Formularios categoría/trabajo ========== */
function mostrarFormCategoria() {
  document.getElementById("form-categoria").style.display = "block";
}
window.mostrarFormCategoria = mostrarFormCategoria;

function mostrarFormTrabajo() {
  document.getElementById("form-trabajo").style.display = "block";
}
window.mostrarFormTrabajo = mostrarFormTrabajo;

async function guardarCategoria() {
  const nombre = document.getElementById("nueva-categoria").value.trim();
  if (!nombre) return alert("Introduce un nombre de categoría");
  const { error } = await supabase.from("categorias").insert([{ nombre }]);
  if (error) return alert("Error guardando categoría: " + error.message);
  document.getElementById("form-categoria").style.display = "none";
  document.getElementById("nueva-categoria").value = "";
  cargarCategorias();
}
window.guardarCategoria = guardarCategoria;

async function guardarTrabajo() {
  const nombre = document.getElementById("nuevo-trabajo").value.trim();
  const categoriaId = selectCategoria.value;
  if (!nombre || !categoriaId) return alert("Selecciona una categoría y escribe un trabajo");
  const { error } = await supabase.from("trabajos").insert([{ nombre, categoria_id: categoriaId }]);
  if (error) return alert("Error guardando trabajo: " + error.message);
  document.getElementById("form-trabajo").style.display = "none";
  document.getElementById("nuevo-trabajo").value = "";
  cargarTrabajos(categoriaId);
}
window.guardarTrabajo = guardarTrabajo;

/* ========== Carga de datos para selects ========== */
async function cargarCategorias() {
  // Formulario "Añadir"
  selectCategoria.innerHTML = "<option value=''>-- Selecciona una categoría --</option>";
  // Filtros "Buscar"
  if (filtroCategoria) filtroCategoria.innerHTML = "<option value=''>-- Todas --</option>";

  const { data, error } = await supabase.from("categorias").select("*").order("nombre");
  if (error) {
    console.error(error);
    return;
  }

  data.forEach(cat => {
    const opt1 = document.createElement("option");
    opt1.value = cat.id;
    opt1.textContent = cat.nombre;
    selectCategoria.appendChild(opt1);

    if (filtroCategoria) {
      const opt2 = document.createElement("option");
      opt2.value = cat.id;
      opt2.textContent = cat.nombre;
      filtroCategoria.appendChild(opt2);
    }
  });

  // Cuando cambie la categoría del formulario "Añadir"
  selectCategoria.onchange = () => {
    const categoriaId = selectCategoria.value;
    if (categoriaId) {
      cargarTrabajos(categoriaId);
    } else {
      selectTrabajo.innerHTML = "<option value=''>-- Selecciona primero una categoría --</option>";
    }
  };

  // Cuando cambie la categoría del filtro "Buscar"
  if (filtroCategoria) {
    filtroCategoria.onchange = () => {
      const categoriaId = filtroCategoria.value;
      if (categoriaId) {
        cargarTrabajos(categoriaId, true);
      } else if (filtroTrabajo) {
        filtroTrabajo.innerHTML = "<option value=''>-- Todos --</option>";
      }
    };
  }
}
window.cargarCategorias = cargarCategorias;

async function cargarTrabajos(categoriaId, isFilter = false) {
  const target = isFilter ? filtroTrabajo : selectTrabajo;
  if (!target) return;
  target.innerHTML = isFilter
    ? "<option value=''>-- Todos --</option>"
    : "<option value=''>-- Selecciona un trabajo --</option>";

  const { data, error } = await supabase
    .from("trabajos")
    .select("*")
    .eq("categoria_id", categoriaId);

  if (error) {
    console.error(error);
    return;
  }

  data.forEach(trabajo => {
    const opt = document.createElement("option");
    opt.value = trabajo.id;
    opt.textContent = trabajo.nombre;
    target.appendChild(opt);
  });
}
window.cargarTrabajos = cargarTrabajos;

/* ========== Flujo de AÑADIR (tabla local) ========== */
function agregarTarea() {
  const fecha = document.getElementById("fecha").value;
  const categoriaId = selectCategoria.value;
  const trabajoId = selectTrabajo.value;
  const categoriaNombre = selectCategoria.options[selectCategoria.selectedIndex]?.text;
  const trabajoNombre = selectTrabajo.options[selectTrabajo.selectedIndex]?.text;

  if (!fecha || !categoriaId || !TrabajoIdVálido(trabajoId)) {
    alert("Completa todos los campos");
    return;
  }

  tareasLocales.push({ fecha, categoriaId, trabajoId, categoriaNombre, trabajoNombre });
  renderTareasLocales();
}
window.agregarTarea = agregarTarea;

function TrabajoIdVálido(id) {
  // Evita añadir la opción vacía
  return id !== null && id !== undefined && id !== "";
}

function renderTareasLocales() {
  const tbody = document.getElementById("tabla-body-local");
  if (!tbody) return;
  tbody.innerHTML = "";

  tareasLocales.forEach((t, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td data-label="Fecha">${t.fecha}</td>
      <td data-label="Categoría">${t.categoriaNombre}</td>
      <td data-label="Trabajo">${t.trabajoNombre}</td>
      <td data-label="Acción"><button onclick="eliminarTareaLocal(${i})">Eliminar</button></td>
    `;
    tbody.appendChild(row);
  });
}

function eliminarTareaLocal(i) {
  tareasLocales.splice(i, 1);
  renderTareasLocales();
}
window.eliminarTareaLocal = eliminarTareaLocal;

async function guardarTodo() {
  if (tareasLocales.length === 0) {
    alert("No hay tareas para guardar");
    return;
  }

  const insertData = tareasLocales.map(t => ({
    fecha: t.fecha,
    categoria_id: t.categoriaId,
    trabajo_id: t.trabajoId
  }));

  const { error } = await supabase.from("tareas").insert(insertData);
  if (error) {
    alert("Error guardando en BD: " + error.message);
    return;
  }

  alert("Tareas guardadas correctamente ✅");
  tareasLocales = [];
  renderTareasLocales();
}
window.guardarTodo = guardarTodo;

/* ========== Pestaña BUSCAR (desde BD) ========== */
async function buscarTareas() {
  const fechaInput = document.getElementById("filtro-fecha");
  const fecha = fechaInput ? fechaInput.value : "";
  const categoriaId = filtroCategoria ? filtroCategoria.value : "";
  const trabajoId = filtroTrabajo ? filtroTrabajo.value : "";

  let query = supabase.from("tareas").select(`
    id, fecha,
    categoria:categorias(nombre),
    trabajo:trabajos(nombre)
  `);

  if (fecha) query = query.eq("fecha", fecha);
  if (categoriaId) query = query.eq("categoria_id", categoriaId);
  if (trabajoId) query = query.eq("trabajo_id", trabajoId);

  const { data, error } = await query;
  if (error) {
    console.error(error);
    return;
  }

  renderTareasBD(data);
}
window.buscarTareas = buscarTareas;

function resetFiltros() {
  const fechaInput = document.getElementById("filtro-fecha");
  if (fechaInput) fechaInput.value = "";
  if (filtroCategoria) filtroCategoria.value = "";
  if (filtroTrabajo) filtroTrabajo.innerHTML = "<option value=''>-- Todos --</option>";
  mostrarTareas();
}
window.resetFiltros = resetFiltros;

async function mostrarTareas() {
  const { data, error } = await supabase.from("tareas").select(`
    id, fecha,
    categoria:categorias(nombre),
    trabajo:trabajos(nombre)
  `);
  if (error) {
    console.error(error);
    return;
  }
  renderTareasBD(data);
}
window.mostrarTareas = mostrarTareas;

function renderTareasBD(data) {
  const tbody = document.getElementById("tabla-body-bd");
  if (!tbody) return;
  tbody.innerHTML = "";

  data.forEach(tarea => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td data-label="Fecha">${tarea.fecha}</td>
      <td data-label="Categoría">${tarea.categoria?.nombre || "-"}</td>
      <td data-label="Trabajo">${tarea.trabajo?.nombre || "-"}</td>
      <td data-label="Acción"><button onclick="eliminarTarea('${tarea.id}')">Eliminar</button></td>
    `;
    tbody.appendChild(row);
  });
}

async function eliminarTarea(id) {
  const { error } = await supabase.from("tareas").delete().eq("id", id);
  if (error) {
    alert("Error eliminando tarea: " + error.message);
    return;
  }
  buscarTareas(); // refresca con filtros activos
}
window.eliminarTarea = eliminarTarea;

/* ========== Inicialización ========== */
cargarCategorias();
mostrarTareas();
mostrarSeccion("add"); // abre en la pestaña Añadir por defecto
