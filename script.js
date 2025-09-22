import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://ltlbdhwsihmsnjjjwxmi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bGJkaHdzaWhtc25qamp3eG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MjYzNjksImV4cCI6MjA3NDEwMjM2OX0.w9-ogm-lElU_Z62eURWzg61rzBPCDT0JEcLdgG6n0Vo";

const supabase = createClient(supabaseUrl, supabaseKey);

const selectCategoria = document.getElementById("categoria");
const selectTrabajo = document.getElementById("trabajo");

const filtroCategoria = document.getElementById("filtro-categoria");
const filtroTrabajo = document.getElementById("filtro-trabajo");

// 🔹 Mostrar secciones
function mostrarSeccion(id) {
  document.querySelectorAll(".seccion").forEach(sec => (sec.style.display = "none"));
  if (id) document.getElementById(id).style.display = "block";
}
window.mostrarSeccion = mostrarSeccion;

// 🔹 Mostrar formularios
function mostrarFormCategoria() {
  document.getElementById("form-categoria").style.display = "block";
}
window.mostrarFormCategoria = mostrarFormCategoria;

function mostrarFormTrabajo() {
  document.getElementById("form-trabajo").style.display = "block";
}
window.mostrarFormTrabajo = mostrarFormTrabajo;

// 🔹 Guardar categoría
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

// 🔹 Guardar trabajo
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

// 🔹 Cargar categorías
async function cargarCategorias() {
  selectCategoria.innerHTML = "<option value=''>-- Selecciona una categoría --</option>";
  filtroCategoria.innerHTML = "<option value=''>-- Todas --</option>";

  const { data, error } = await supabase.from("categorias").select("*").order("nombre");
  if (error) return console.error(error);

  data.forEach(cat => {
    const opt1 = document.createElement("option");
    opt1.value = cat.id;
    opt1.textContent = cat.nombre;
    selectCategoria.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = cat.id;
    opt2.textContent = cat.nombre;
    filtroCategoria.appendChild(opt2);
  });

  selectCategoria.addEventListener("change", () => {
    const categoriaId = selectCategoria.value;
    if (categoriaId) {
      cargarTrabajos(categoriaId);
    } else {
      selectTrabajo.innerHTML = "<option value=''>-- Selecciona primero una categoría --</option>";
    }
  });

  filtroCategoria.addEventListener("change", () => {
    const categoriaId = filtroCategoria.value;
    if (categoriaId) {
      cargarTrabajos(categoriaId, true);
    } else {
      filtroTrabajo.innerHTML = "<option value=''>-- Todos --</option>";
    }
  });
}
window.cargarCategorias = cargarCategorias;

// 🔹 Cargar trabajos
async function cargarTrabajos(categoriaId, isFilter = false) {
  const target = isFilter ? filtroTrabajo : selectTrabajo;
  target.innerHTML = "<option value=''>-- Selecciona un trabajo --</option>";

  const { data, error } = await supabase.from("trabajos").select("*").eq("categoria_id", categoriaId);
  if (error) return console.error(error);

  data.forEach(trabajo => {
    const opt = document.createElement("option");
    opt.value = trabajo.id;
    opt.textContent = trabajo.nombre;
    target.appendChild(opt);
  });
}
window.cargarTrabajos = cargarTrabajos;

// 🔹 Guardar tarea
async function agregarTarea() {
  const fecha = document.getElementById("fecha").value;
  const categoriaId = selectCategoria.value;
  const trabajoId = selectTrabajo.value;
  if (!fecha || !categoriaId || !trabajoId) return alert("Completa todos los campos");

  const { error } = await supabase.from("tareas").insert([{ fecha, categoria_id: categoriaId, trabajo_id: trabajoId }]);
  if (error) return alert("Error guardando tarea: " + error.message);

  mostrarTareas();
}
window.agregarTarea = agregarTarea;

// 🔹 Buscar tareas
async function buscarTareas() {
  const fecha = document.getElementById("filtro-fecha").value;
  const categoriaId = filtroCategoria.value;
  const trabajoId = filtroTrabajo.value;

  let query = supabase.from("tareas").select(`
    id, fecha,
    categoria:categorias(nombre),
    trabajo:trabajos(nombre)
  `);

  if (fecha) query = query.eq("fecha", fecha);
  if (categoriaId) query = query.eq("categoria_id", categoriaId);
  if (trabajoId) query = query.eq("trabajo_id", trabajoId);

  const { data, error } = await query;
  if (error) return console.error(error);

  renderTareas(data);
}
window.buscarTareas = buscarTareas;

// 🔹 Reset filtros
function resetFiltros() {
  document.getElementById("filtro-fecha").value = "";
  filtroCategoria.value = "";
  filtroTrabajo.innerHTML = "<option value=''>-- Todos --</option>";
  mostrarTareas();
}
window.resetFiltros = resetFiltros;

// 🔹 Mostrar todas las tareas
async function mostrarTareas() {
  const { data, error } = await supabase.from("tareas").select(`
    id, fecha,
    categoria:categorias(nombre),
    trabajo:trabajos(nombre)
  `);
  if (error) return console.error(error);

  renderTareas(data);
}
window.mostrarTareas = mostrarTareas;

// 🔹 Renderizar tabla
function renderTareas(data) {
  const tbody = document.getElementById("tabla-body");
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

// 🔹 Eliminar tarea
async function eliminarTarea(id) {
  const { error } = await supabase.from("tareas").delete().eq("id", id);
  if (error) return alert("Error eliminando tarea: " + error.message);
  buscarTareas(); // refresca usando filtros activos
}
window.eliminarTarea = eliminarTarea;

// Inicialización
cargarCategorias();
mostrarTareas();
mostrarSeccion("");
