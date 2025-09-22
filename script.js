import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://ltlbdhwsihmsnjjjwxmi.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bGJkaHdzaWhtc25qamp3eG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MjYzNjksImV4cCI6MjA3NDEwMjM2OX0.w9-ogm-lElU_Z62eURWzg61rzBPCDT0JEcLdgG6n0Vo";

const supabase = createClient(supabaseUrl, supabaseKey);

const selectCategoria = document.getElementById("categoria");
const selectTrabajo = document.getElementById("trabajo");

// 🔹 Mostrar secciones
function mostrarSeccion(id) {
  document.querySelectorAll(".seccion").forEach(sec => (sec.style.display = "none"));
  if (id) document.getElementById(id).style.display = "block";
}
window.mostrarSeccion = mostrarSeccion;

// 🔹 Mostrar formulario nueva categoría
function mostrarFormCategoria() {
  document.getElementById("form-categoria").style.display = "block";
}
window.mostrarFormCategoria = mostrarFormCategoria;

// 🔹 Guardar categoría
async function guardarCategoria() {
  const nombre = document.getElementById("nueva-categoria").value.trim();
  if (!nombre) {
    alert("Introduce un nombre de categoría");
    return;
  }
  const { error } = await supabase.from("categorias").insert([{ nombre }]);
  if (error) {
    alert("Error guardando categoría: " + error.message);
    return;
  }
  document.getElementById("form-categoria").style.display = "none";
  document.getElementById("nueva-categoria").value = "";
  cargarCategorias();
}
window.guardarCategoria = guardarCategoria;

// 🔹 Mostrar formulario nuevo trabajo
function mostrarFormTrabajo() {
  document.getElementById("form-trabajo").style.display = "block";
}
window.mostrarFormTrabajo = mostrarFormTrabajo;

// 🔹 Guardar trabajo
async function guardarTrabajo() {
  const nombre = document.getElementById("nuevo-trabajo").value.trim();
  const categoriaId = selectCategoria.value;
  if (!nombre || !categoriaId) {
    alert("Selecciona una categoría y escribe un trabajo");
    return;
  }
  const { error } = await supabase
    .from("trabajos")
    .insert([{ nombre, categoria_id: categoriaId }]);
  if (error) {
    alert("Error guardando trabajo: " + error.message);
    return;
  }
  document.getElementById("form-trabajo").style.display = "none";
  document.getElementById("nuevo-trabajo").value = "";
  cargarTrabajos(categoriaId);
}
window.guardarTrabajo = guardarTrabajo;

// 🔹 Cargar categorías
async function cargarCategorias() {
  selectCategoria.innerHTML = "<option value=''>-- Selecciona una categoría --</option>";
  selectTrabajo.innerHTML = "<option value=''>-- Selecciona primero una categoría --</option>";

  const { data, error } = await supabase.from("categorias").select("*").order("nombre");
  if (error) {
    console.error(error);
    return;
  }

  data.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.nombre;
    selectCategoria.appendChild(option);
  });

  // Cuando cambie la categoría, refrescar trabajos
  selectCategoria.addEventListener("change", () => {
    const categoriaId = selectCategoria.value;
    if (categoriaId) {
      cargarTrabajos(categoriaId);
    } else {
      selectTrabajo.innerHTML = "<option value=''>-- Selecciona primero una categoría --</option>";
    }
  });
}
window.cargarCategorias = cargarCategorias;

// 🔹 Cargar trabajos de una categoría
async function cargarTrabajos(categoriaId) {
  selectTrabajo.innerHTML = "<option value=''>-- Selecciona un trabajo --</option>";

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
    selectTrabajo.appendChild(opt);
  });
}
window.cargarTrabajos = cargarTrabajos;

// 🔹 Guardar nueva tarea
async function agregarTarea() {
  const fecha = document.getElementById("fecha").value;
  const categoriaId = selectCategoria.value;
  const trabajoId = selectTrabajo.value;

  if (!fecha || !categoriaId || !trabajoId) {
    alert("Completa todos los campos");
    return;
  }

  const { error } = await supabase
    .from("tareas")
    .insert([{ fecha, categoria_id: categoriaId, trabajo_id: trabajoId }]);
  if (error) {
    alert("Error guardando tarea: " + error.message);
    return;
  }
  mostrarTareas(categoriaId); // refrescamos filtrado
}
window.agregarTarea = agregarTarea;

// 🔹 Buscar tareas (al pulsar botón)
function buscarTareas() {
  const categoriaId = selectCategoria.value;
  if (categoriaId) {
    mostrarTareas(categoriaId);
  } else {
    mostrarTareas(); // todas
  }
}
window.buscarTareas = buscarTareas;

// 🔹 Mostrar tareas (con data-label para móvil)
async function mostrarTareas(categoriaId = null) {
  const tbody = document.getElementById("tabla-body");
  tbody.innerHTML = "";

  let query = supabase
    .from("tareas")
    .select(`
      id,
      fecha,
      categoria:categorias(nombre),
      trabajo:trabajos(nombre)
    `);

  if (categoriaId) {
    query = query.eq("categoria_id", categoriaId);
  }

  const { data, error } = await query;
  if (error) {
    console.error(error);
    return;
  }

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
window.mostrarTareas = mostrarTareas;

// 🔹 Eliminar tarea
async function eliminarTarea(id) {
  const { error } = await supabase.from("tareas").delete().eq("id", id);
  if (error) {
    alert("Error eliminando tarea: " + error.message);
    return;
  }
  const categoriaId = selectCategoria.value;
  mostrarTareas(categoriaId || null);
}
window.eliminarTarea = eliminarTarea;

// Inicialización
cargarCategorias();
mostrarTareas(); // todas al inicio
mostrarSeccion("");
