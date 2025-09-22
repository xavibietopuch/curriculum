import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://ltlbdhwsihmsnjjjwxmi.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0bGJkaHdzaWhtc25qamp3eG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MjYzNjksImV4cCI6MjA3NDEwMjM2OX0.w9-ogm-lElU_Z62eURWzg61rzBPCDT0JEcLdgG6n0Vo";

const supabase = createClient(supabaseUrl, supabaseKey);

// Selects del formulario "Añadir"
const selectCategoria = document.getElementById("categoria");
const selectTrabajo = document.getElementById("trabajo");
const selectCliente = document.getElementById("cliente");

// Selects de filtros en "Buscar"
const filtroCategoria = document.getElementById("filtro-categoria");
const filtroTrabajo = document.getElementById("filtro-trabajo");
const filtroCliente = document.getElementById("filtro-cliente");

// Array temporal para la tabla local
let tareasLocales = [];

/* ========== Navegación de secciones ========== */
function mostrarSeccion(id) {
  document
    .querySelectorAll(".seccion")
    .forEach((sec) => (sec.style.display = "none"));
  if (id) document.getElementById(id).style.display = "block";
}
window.mostrarSeccion = mostrarSeccion;

/* ========== Formularios de entidad ========== */
function mostrarFormCategoria() {
  document.getElementById("form-categoria").style.display = "block";
}
window.mostrarFormCategoria = mostrarFormCategoria;

function mostrarFormTrabajo() {
  document.getElementById("form-trabajo").style.display = "block";
}
window.mostrarFormTrabajo = mostrarFormTrabajo;

function mostrarFormCliente() {
  document.getElementById("form-cliente").style.display = "block";
}
window.mostrarFormCliente = mostrarFormCliente;

/* ========== Guardar entidades ========== */
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
  if (!nombre || !categoriaId)
    return alert("Selecciona una categoría y escribe un trabajo");
  const { error } = await supabase
    .from("trabajos")
    .insert([{ nombre, categoria_id: categoriaId }]);
  if (error) return alert("Error guardando trabajo: " + error.message);
  document.getElementById("form-trabajo").style.display = "none";
  document.getElementById("nuevo-trabajo").value = "";
  cargarTrabajos(categoriaId);
}
window.guardarTrabajo = guardarTrabajo;

async function guardarCliente() {
  const nombre = document.getElementById("nuevo-cliente").value.trim();
  if (!nombre) return alert("Introduce un nombre de cliente");
  const { error } = await supabase.from("clientes").insert([{ nombre }]);
  if (error) return alert("Error guardando cliente: " + error.message);
  document.getElementById("form-cliente").style.display = "none";
  document.getElementById("nuevo-cliente").value = "";
  cargarClientes();
}
window.guardarCliente = guardarCliente;

/* ========== Carga de selects ========== */
async function cargarCategorias() {
  selectCategoria.innerHTML =
    "<option value=''>-- Selecciona una categoría --</option>";
  if (filtroCategoria)
    filtroCategoria.innerHTML = "<option value=''>-- Todas --</option>";

  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("nombre");
  if (error) return console.error(error);

  data.forEach((cat) => {
    selectCategoria.append(new Option(cat.nombre, cat.id));
    if (filtroCategoria) filtroCategoria.append(new Option(cat.nombre, cat.id));
  });

  selectCategoria.onchange = () => {
    if (selectCategoria.value) cargarTrabajos(selectCategoria.value);
    else
      selectTrabajo.innerHTML =
        "<option value=''>-- Selecciona primero una categoría --</option>";
  };
}
window.cargarCategorias = cargarCategorias;

async function cargarTrabajos(categoriaId, isFilter = false) {
  const target = isFilter ? filtroTrabajo : selectTrabajo;
  target.innerHTML = isFilter
    ? "<option value=''>-- Todos --</option>"
    : "<option value=''>-- Selecciona un trabajo --</option>";

  const { data, error } = await supabase
    .from("trabajos")
    .select("*")
    .eq("categoria_id", categoriaId);
  if (error) return console.error(error);

  data.forEach((trabajo) => {
    target.append(new Option(trabajo.nombre, trabajo.id));
  });
}
window.cargarTrabajos = cargarTrabajos;

async function cargarClientes() {
  selectCliente.innerHTML =
    "<option value=''>-- Selecciona un cliente --</option>";
  if (filtroCliente)
    filtroCliente.innerHTML = "<option value=''>-- Todos --</option>";

  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("nombre");
  if (error) return console.error(error);

  data.forEach((cli) => {
    selectCliente.append(new Option(cli.nombre, cli.id));
    if (filtroCliente) filtroCliente.append(new Option(cli.nombre, cli.id));
  });
}
window.cargarClientes = cargarClientes;

/* ========== Flujo Añadir (local) ========== */
function agregarTarea() {
  const fecha = document.getElementById("fecha").value;
  const categoriaId = selectCategoria.value;
  const trabajoId = selectTrabajo.value;
  const clienteId = selectCliente.value;
  const observaciones = document.getElementById("observaciones").value.trim();

  const categoriaNombre =
    selectCategoria.options[selectCategoria.selectedIndex]?.text;
  const trabajoNombre =
    selectTrabajo.options[selectTrabajo.selectedIndex]?.text;
  const clienteNombre =
    selectCliente.options[selectCliente.selectedIndex]?.text;

  if (!fecha || !categoriaId || !trabajoId || !clienteId) {
    return alert("Completa todos los campos");
  }

  tareasLocales.push({
    fecha,
    categoriaId,
    trabajoId,
    clienteId,
    observaciones,
    categoriaNombre,
    trabajoNombre,
    clienteNombre,
  });
  renderTareasLocales();
}
window.agregarTarea = agregarTarea;

function renderTareasLocales() {
  const tbody = document.getElementById("tabla-body-local");
  tbody.innerHTML = "";
  tareasLocales.forEach((t, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${t.fecha}</td>
        <td>${t.categoriaNombre}</td>
        <td>${t.trabajoNombre}</td>
        <td>${t.clienteNombre}</td>
        <td>${t.observaciones || "-"}</td>
        <td><button onclick="eliminarTareaLocal(${i})">Eliminar</button></td>
      </tr>`;
  });
}

function eliminarTareaLocal(i) {
  tareasLocales.splice(i, 1);
  renderTareasLocales();
}
window.eliminarTareaLocal = eliminarTareaLocal;

async function guardarTodo() {
  if (tareasLocales.length === 0) return alert("No hay tareas para guardar");

  const insertData = tareasLocales.map((t) => ({
    fecha: t.fecha,
    categoria_id: t.categoriaId,
    trabajo_id: t.trabajoId,
    cliente_id: t.clienteId,
    observaciones: t.observaciones,
  }));

  const { error } = await supabase.from("tareas").insert(insertData);
  if (error) return alert("Error guardando en BD: " + error.message);

  alert("Tareas guardadas correctamente ✅");
  tareasLocales = [];
  renderTareasLocales();
}
window.guardarTodo = guardarTodo;

/* ========== Buscar/Mostrar desde BD ========== */
async function buscarTareas() {
  const fecha = document.getElementById("filtro-fecha")?.value;
  const categoriaId = filtroCategoria?.value;
  const trabajoId = filtroTrabajo?.value;
  const clienteId = filtroCliente?.value;

  let query = supabase.from("tareas").select(`
    id, fecha, observaciones,
    categoria:categorias(nombre),
    trabajo:trabajos(nombre),
    cliente:clientes(nombre)
  `);

  if (fecha) query = query.eq("fecha", fecha);
  if (categoriaId) query = query.eq("categoria_id", categoriaId);
  if (trabajoId) query = query.eq("trabajo_id", trabajoId);
  if (clienteId) query = query.eq("cliente_id", clienteId);

  const { data, error } = await query;
  if (error) return console.error(error);

  renderTareasBD(data);
}
window.buscarTareas = buscarTareas;

function renderTareasBD(data) {
  const tbody = document.getElementById("tabla-body-bd");
  tbody.innerHTML = "";
  data.forEach((t) => {
    tbody.innerHTML += `
      <tr>
        <td><input type="checkbox"></td>
        <td>${t.fecha}</td>
        <td>${t.categoria?.nombre || "-"}</td>
        <td>${t.trabajo?.nombre || "-"}</td>
        <td>${t.cliente?.nombre || "-"}</td>
        <td>${t.observaciones || "-"}</td>
        <td><button onclick="eliminarTarea('${t.id}')">Eliminar</button></td>
      </tr>`;
  });
}

async function eliminarTarea(id) {
  await supabase.from("tareas").delete().eq("id", id);
  buscarTareas();
}
window.eliminarTarea = eliminarTarea;

/* ========== Imprimir seleccionados ========== */
function imprimirSeleccionados() {
  const filas = document.querySelectorAll("#tabla-body-bd tr");
  let contenido =
    "<h2>Tareas seleccionadas</h2><table border='1'><tr><th>Fecha</th><th>Categoría</th><th>Trabajo</th><th>Cliente</th><th>Observaciones</th></tr>";

  filas.forEach((fila) => {
    const check = fila.querySelector("input[type='checkbox']");
    if (check && check.checked) {
      const celdas = fila.querySelectorAll("td");
      contenido += `<tr>
        <td>${celdas[1].innerText}</td>
        <td>${celdas[2].innerText}</td>
        <td>${celdas[3].innerText}</td>
        <td>${celdas[4].innerText}</td>
        <td>${celdas[5].innerText}</td>
      </tr>`;
    }
  });

  contenido += "</table>";
  const ventana = window.open("", "_blank");
  ventana.document.write(contenido);
  ventana.print();
}
window.imprimirSeleccionados = imprimirSeleccionados;

/* ========== Inicialización ========== */
cargarCategorias();
cargarClientes();
buscarTareas();
mostrarSeccion("add");
