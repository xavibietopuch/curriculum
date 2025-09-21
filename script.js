// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, deleteDoc, doc, 
  setDoc, updateDoc, arrayUnion 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Configuración Firebase (ya con tus datos reales)
const firebaseConfig = {
  apiKey: "AIzaSyC7tNYGFF9GCNpnyGslKoWR6tFsW_6PFLE",
  authDomain: "bdtareasjosep.firebaseapp.com",
  projectId: "bdtareasjosep",
  storageBucket: "bdtareasjosep.firebasestorage.app",
  messagingSenderId: "791774072477",
  appId: "1:791774072477:web:d8aa3775bf9aee6439ce74"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const selectCategoria = document.getElementById("categoria");
const selectTrabajo = document.getElementById("trabajo");

// 🔹 Mostrar secciones
function mostrarSeccion(id) {
  document.querySelectorAll('.seccion').forEach(sec => sec.style.display = 'none');
  if (id) document.getElementById(id).style.display = 'block';
}
window.mostrarSeccion = mostrarSeccion;

// 🔹 Mostrar formulario de nueva categoría
function mostrarFormCategoria() {
  document.getElementById("form-categoria").style.display = "block";
}
window.mostrarFormCategoria = mostrarFormCategoria;

// 🔹 Guardar nueva categoría en Firebase
async function guardarCategoria() {
  const nombre = document.getElementById("nueva-categoria").value.trim();
  if (!nombre) {
    alert("Introduce un nombre de categoría");
    return;
  }
  await setDoc(doc(db, "categorias", nombre), { trabajos: [] });
  document.getElementById("form-categoria").style.display = "none";
  document.getElementById("nueva-categoria").value = "";
  cargarCategorias();
}
window.guardarCategoria = guardarCategoria;

// 🔹 Mostrar formulario de nuevo trabajo
function mostrarFormTrabajo() {
  document.getElementById("form-trabajo").style.display = "block";
}
window.mostrarFormTrabajo = mostrarFormTrabajo;

// 🔹 Guardar nuevo trabajo en la categoría actual
async function guardarTrabajo() {
  const trabajo = document.getElementById("nuevo-trabajo").value.trim();
  const categoria = selectCategoria.value;
  if (!trabajo || !categoria) {
    alert("Selecciona una categoría y escribe un trabajo");
    return;
  }
  await updateDoc(doc(db, "categorias", categoria), {
    trabajos: arrayUnion(trabajo)
  });
  document.getElementById("form-trabajo").style.display = "none";
  document.getElementById("nuevo-trabajo").value = "";
  cargarTrabajos(categoria);
}
window.guardarTrabajo = guardarTrabajo;

// 🔹 Cargar categorías
async function cargarCategorias() {
  selectCategoria.innerHTML = "";
  const snap = await getDocs(collection(db, "categorias"));
  snap.forEach(docSnap => {
    const option = document.createElement("option");
    option.value = docSnap.id;
    option.textContent = docSnap.id;
    selectCategoria.appendChild(option);
  });
}
window.cargarCategorias = cargarCategorias;

// 🔹 Cargar trabajos
async function cargarTrabajos(cat) {
  selectTrabajo.innerHTML = "";
  const snap = await getDocs(collection(db, "categorias"));
  snap.forEach(d => {
    if (d.id === cat) {
      const datos = d.data().trabajos || [];
      datos.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        selectTrabajo.appendChild(opt);
      });
    }
  });
}
window.cargarTrabajos = cargarTrabajos;

// 🔹 Agregar tarea a Firebase
async function agregarTarea() {
  const fecha = document.getElementById("fecha").value;
  const categoria = selectCategoria.value;
  const trabajo = selectTrabajo.value;

  if (!fecha || !categoria || !trabajo) {
    alert("Completa todos los campos");
    return;
  }

  await addDoc(collection(db, "tareas"), { fecha, categoria, trabajo });
  mostrarTareas();
}
window.agregarTarea = agregarTarea;

// 🔹 Mostrar tareas en tabla
async function mostrarTareas() {
  const tbody = document.getElementById("tabla-body");
  tbody.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "tareas"));
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.fecha}</td>
      <td>${data.categoria}</td>
      <td>${data.trabajo}</td>
      <td><button onclick="eliminarTarea('${docSnap.id}')">Eliminar</button></td>
    `;
    tbody.appendChild(row);
  });
}
window.mostrarTareas = mostrarTareas;

// 🔹 Eliminar tarea
async function eliminarTarea(id) {
  await deleteDoc(doc(db, "tareas", id));
  mostrarTareas();
}
window.eliminarTarea = eliminarTarea;

// Inicialización
cargarCategorias();
mostrarTareas();
mostrarSeccion('');
