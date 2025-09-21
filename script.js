// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } 
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Configuración Firebase
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

// Mapa de trabajos según categoría
const trabajosPorCategoria = {
  electricidad: ["1", "2"],
  fontaneria: ["5", "6"]
};

// Mostrar secciones
function mostrarSeccion(id) {
  document.querySelectorAll('.seccion').forEach(sec => sec.style.display = 'none');
  if (id) document.getElementById(id).style.display = 'block';
}
window.mostrarSeccion = mostrarSeccion;

// Actualizar trabajos según categoría
function actualizarTrabajos() {
  const cat = document.getElementById("categoria").value;
  const trabajos = trabajosPorCategoria[cat] || [];
  const select = document.getElementById("trabajo");
  select.innerHTML = "";
  trabajos.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t;
    select.appendChild(opt);
  });
}
window.actualizarTrabajos = actualizarTrabajos;

// Agregar tarea a Firebase
async function agregarTarea() {
  const fecha = document.getElementById("fecha").value;
  const categoria = document.getElementById("categoria").value;
  const trabajo = document.getElementById("trabajo").value;

  if (!fecha || !categoria || !trabajo) {
    alert("Completa todos los campos");
    return;
  }

  await addDoc(collection(db, "tareas"), { fecha, categoria, trabajo });
  mostrarTareas();
}
window.agregarTarea = agregarTarea;

// Mostrar tareas en tabla
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

// Eliminar tarea
async function eliminarTarea(id) {
  await deleteDoc(doc(db, "tareas", id));
  mostrarTareas();
}
window.eliminarTarea = eliminarTarea;

// Ocultar secciones al inicio
mostrarSeccion('');
