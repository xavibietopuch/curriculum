// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } 
  from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ⚠️ Sustituye con tu configuración de Firebase
const firebaseConfig = {
  apiKey: "TU_APIKEY",
  authDomain: "TU_DOMINIO.firebaseapp.com",
  projectId: "TU_PROJECTID",
  storageBucket: "TU_BUCKET.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mapa de trabajos por categoría
const trabajosPorCategoria = {
  electricidad: ["Conectar cables", "Desconectar cables"],
  fontaneria: ["Cortar tubo", "Pegar tubo"]
};

// Mostrar secciones
function mostrarSeccion(id) {
  document.querySelectorAll('.seccion').forEach(sec => sec.style.display = 'none');
  document.getElementById(id).style.display = 'block';
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

// Al cargar la página
mostrarSeccion(''); // oculta todo al inicio
