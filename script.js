// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, deleteDoc, doc, 
  setDoc, updateDoc, arrayUnion 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

const selectCategoria = document.getElementById("categoria");
const selectTrabajo = document.getElementById("trabajo");

// 🔹 Mostrar secciones
function mostrarSeccion(id) {
  document.querySelectorAll('.seccion').forEach(sec => sec.style.display = 'none');
  if (id) document.getElementById(id).style.display = 'block';
}
window.mostrarSeccion = mostrarSeccion;

// 🔹 Cargar categorías desde Firebase
async function cargarCategorias() {
  selectCategoria.innerHTML = "";
  const snap = await getDocs(collection(db, "categorias"));
  snap.forEach(docSnap => {
    const option = document.createElement("option");
    option.value = docSnap.id;
    option.textContent = docSnap.id;
    selectCategoria.appendChild(option);
  });
  // opción especial para añadir nueva
  const extra = document.createElement("option");
  extra.value = "__nueva__";
  extra.textContent = "+ Añadir categoría";
  selectCategoria.appendChild(extra);
}
window.cargarCategorias = cargarCategorias;

// 🔹 Al cambiar de categoría
selectCategoria.addEventListener("change", async () => {
  if (selectCategoria.value === "__nueva__") {
    const nueva = prompt("Introduce el nombre de la nueva categoría:");
    if (nueva) {
      await setDoc(doc(db, "categorias", nueva), { trabajos: [] });
      await cargarCategorias();
      selectCategoria.value = nueva;
      cargarTrabajos(nueva);
    }
  } else {
    cargarTrabajos(selectCategoria.value);
  }
});

// 🔹 Cargar trabajos según categoría
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
  // opción para añadir trabajo nuevo
  const extra = document.createElement("option");
  extra.value = "__nuevo__";
  extra.textContent = "+ Añadir trabajo";
  selectTrabajo.appendChild(extra);
}
window.cargarTrabajos = cargarTrabajos;

// 🔹 Al cambiar de trabajo
selectTrabajo.addEventListener("change", async () => {
  if (selectTrabajo.value === "__nuevo__") {
    const nuevo = prompt("Introduce el nuevo trabajo:");
    if (nuevo) {
      await updateDoc(doc(db, "categorias", selectCategoria.value), {
        trabajos: arrayUnion(nuevo)
      });
      cargarTrabajos(selectCategoria.value);
    }
  }
});

// 🔹 Agregar tarea a Firebase
async function agregarTarea() {
  const fecha = document.getElementById("fecha").value;
  const categoria = document.getElementById("categoria").value;
  const trabajo = document.getElementById("trabajo").value;

  if (!fecha || !categoria || !trabajo || categoria === "__nueva__" || trabajo === "__nuevo__") {
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

// Inicialización al cargar
cargarCategorias();
mostrarTareas();
mostrarSeccion('');
