// Login
let botonIncioSesion = document.getElementById("botonIniciarSesion");
let inputAPIKey = document.getElementById("inputAPIKey");
let panelLogin = document.getElementById("panelLogin");
let displayUsuario = document.getElementById("nombreUsuario");

let usuario = ""
let APIKey = ""
// Proyectos
let tablaListaProyectos = document.getElementById("tablaListaProyectos");
let panelDetallesProyecto = document.getElementById("panelDetallesProyecto");
//Panel detalles proyecto
let displayNombreProyectoPanel = document.getElementById("displayNombreProyectoPanel")
let displayFechaCreacionProyectoPanel = document.getElementById("displayFechaCreacionProyectoPanel")
let displayUltimaModificacionProyectoPanel = document.getElementById("displayUltimaModificacionProyectoPanel")
let displayListaMiembrosProyectoPanel = document.getElementById("displayListaMiembrosProyectoPanel")
let tablaListaTareasRecientesProyecto = document.getElementById("tablaListaTareasRecientesProyecto")
let tablaListaTareasLargasProyecto = document.getElementById("tablaListaTareasLargasProyecto")
// Usuarios
let tablaListaUsuario = document.getElementById("tablaListaUsuario")
let panelDetallesUsuario = document.getElementById("panelDetallesUsuario");

//Panel detalles Usuario
let displayNombreUsuarioPanel = document.getElementById("displayNombreUsuarioPanel")
let displayFechaCreacionUsuarioPanel = document.getElementById("displayFechaCreacionUsuarioPanel")
let displayUltimaModificacionUsuarioPanel = document.getElementById("displayUltimaModificacionUsuarioPanel")
let displayListaMiembrosUsuarioPanel = document.getElementById("displayListaMiembrosUsuarioPanel")
let tablaListaTareasRecientesUsuario = document.getElementById("tablaListaTareasRecientesUsuario")
let tablaListaTareasLargasUsuario = document.getElementById("tablaListaTareasLargasUsuario")
// Navegar entre secciones
let indexSeccionActiva = 0
let seccionBoton = document.getElementsByClassName("seccion-button");
let secciones = document.getElementsByClassName("seccionPrincipal");

const baseURL = "http://localhost:8080/api/v3/";

document.addEventListener("DOMContentLoaded", () => {
        let apikey = localStorage.getItem("APIKey");
        if (apikey) {
            iniciarSesion(apikey);
        }
        let indice = parseInt(localStorage.getItem("indexSeccionActiva"));
        if (indice) {
            cambiarSeccion(indice);
        }
    }
)

botonIncioSesion.addEventListener("click", () => {
    iniciarSesion(inputAPIKey.value);
});

async function HacerPeticion(url, apikey) {
    try {
        const response = await fetch(baseURL + url, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + btoa(`apikey:${apikey}`), // btoa codifica a Base64
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
        }
        let data = await response.json();
        return data;
        // Aquí puedes trabajar con los datos recibidos
    } catch (error) {
        console.error('Error al conectar con la API de OpenProject:', error);
    }
}

async function iniciarSesion(apikey) {
    let data = await HacerPeticion("users/me", apikey);
    if (data == null) return;
    APIKey = apikey;
    localStorage.setItem("APIKey", APIKey);
    MoverPanelLogin()
    usuario = data.firstName
    displayUsuario.innerHTML = usuario;
    CargarDatos();
}

function CargarDatos() {
    CargarProyectos();
    CargarUsuarios();
    // CargarTareasPorDuracion();
    // CargarTareasMasNuevas();
    // CargarTareasPorProyecto();
    CargarHorasPorUsuario();
}

function MoverPanelLogin() {

    panelLogin.classList.toggle("mover");

}

async function CargarProyectos() {
    let data = await HacerPeticion("projects", APIKey);
    if (data == null) return;
    tablaListaProyectos.innerHTML = ""
    for (let proyectoIndex in data._embedded.elements) {
        tablaListaProyectos.innerHTML += `
                <tr class="trProyecto" onclick="AbrirProyecto('${data._embedded.elements[proyectoIndex].id}')">
                    <td>${data._embedded.elements[proyectoIndex].name}</td>
                    <td>Name</td>
                </tr>`
    }

}

async function AbrirProyecto(idProyecto) {
    let datosProyecto = await HacerPeticion(`projects/${idProyecto}`, APIKey);
    panelDetallesProyecto.classList.add("activo")

    let nombre = datosProyecto.name
    let fechaCreacion = datosProyecto.createdAt
    let ultModificacion = datosProyecto.updatedAt


    displayNombreProyectoPanel.innerHTML = nombre
    displayFechaCreacionProyectoPanel.innerHTML = fechaCreacion
    displayUltimaModificacionProyectoPanel.innerHTML = ultModificacion
    displayListaMiembrosProyectoPanel.innerHTML = ""
    if (datosProyecto._links.memberships != null) {
        let miembrosData = await HacerPeticion(datosProyecto._links.memberships.href.replace("/api/v3/", ""), APIKey)
        let miembros = []

        miembrosData._embedded.elements.forEach(element => {
            miembros.push(element._links.principal.title)
        })


        miembros.forEach(element => {
            displayListaMiembrosProyectoPanel.innerHTML += `<li>${element}</li>`
        })
    }

    let tareasNuevasProyectoData = await HacerPeticion(`projects/${idProyecto}/work_packages?pageSize=5&sortBy=[["createdAt","desc"]]`, APIKey)

    tablaListaTareasRecientesProyecto.innerHTML = ""
    tareasNuevasProyectoData._embedded.elements.forEach(element => {
        tablaListaTareasRecientesProyecto.innerHTML += `
        <tr>
            <td>
                ${element.subject}
            </td>
            <td>
                ${FormtearDuracion(element.duration)}
            </td>
            <td>
                ${element.createdAt}
            </td>
        </tr>
        `
    })

    let tareasLargasProyectoData = await HacerPeticion(`projects/${idProyecto}/work_packages?pageSize=5&sortBy=[["duration","desc"]]`, APIKey)

    tablaListaTareasLargasProyecto.innerHTML = ""
    tareasLargasProyectoData._embedded.elements.forEach(element => {
        tablaListaTareasLargasProyecto.innerHTML += `
        <tr>
            <td>
                ${element.subject}
            </td>
            <td>
                ${FormtearDuracion(element.duration)}
            </td>
            <td>
                ${element.createdAt}
            </td>
        </tr>
        `
    })
}

function CerrarDetalles() {
    panelDetallesProyecto.classList.remove("activo")
    panelDetallesUsuario.classList.remove("activo")
}

async function CargarUsuarios() {
    let data = await HacerPeticion("users", APIKey);
    if (data == null) return;

    tablaListaUsuario.innerHTML = ""
    for (let userIndex in data._embedded.elements) {
        let usuarioData = data._embedded.elements[userIndex]
        tablaListaUsuario.innerHTML += `
            <tr class="trProyecto" onclick="AbrirUsuario(${data._embedded.elements[userIndex].id})">
                <td>${usuarioData.login}</td>
                <td>${usuarioData.firstName}</td>
                <td>${usuarioData.lastName}</td>
            </tr>`
    }

}

async function AbrirUsuario(idUsuario) {
    let datosUsuario = await HacerPeticion(`users/${idUsuario}`, APIKey);
    panelDetallesUsuario.classList.add("activo")

    let nombre = datosUsuario.name
    let fechaCreacion = datosUsuario.createdAt
    let ultModificacion = datosUsuario.updatedAt


    displayNombreUsuarioPanel.innerHTML = nombre
    displayFechaCreacionUsuarioPanel.innerHTML = fechaCreacion
    displayUltimaModificacionUsuarioPanel.innerHTML = ultModificacion

    tablaListaTareasRecientesUsuario.innerHTML = ""
    horasDiccionario[nombre].forEach(element => {
        tablaListaTareasRecientesUsuario.innerHTML += `
        <tr>
            <td>
                ${element._links.workPackage.title}
            </td>
            <td>
                ${FormtearDuracion(element.hours)}
            </td>
            <td>
                ${element.createdAt}
            </td>
        </tr>
        `
    })
}

let horasDiccionario = {}

async function CargarHorasPorUsuario() {
    let data = await HacerPeticion('time_entries?grouBy="user"', APIKey);


    data._embedded.elements.forEach(element => {
        let key = element._links.user.title
        if (!horasDiccionario[key]) {
            horasDiccionario[key] = []
        }
        horasDiccionario[key].push(element)
    })

}

function FormtearDuracion(duracion) {
    if (duracion == null) return ""
    let d = duracion.replace("PT", "")
    d = d.replace("P", "")
    d = d.replace("H", " horas")
    d = d.replace("D", " dias")
    return d
}


function cambiarSeccion(i) {
    indexSeccionActiva = i;
    for (let i = 0;
         i < secciones.length;
         i++
    ) {
        secciones[i].classList.remove("activa");
        seccionBoton[i].classList.remove("activa");
    }


    secciones[i].classList.add("activa");
    seccionBoton[i].classList.add("activa");
    localStorage.setItem("indexSeccionActiva", indexSeccionActiva)
}

function CerrarSesion() {
    localStorage.setItem("APIKey", "")
    APIKey = ""
    panelLogin.classList.toggle("mover");
}
