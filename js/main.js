let botonIncioSesion = document.getElementById("botonIniciarSesion");
let inputAPIKey = document.getElementById("inputAPIKey");
let panelLogin = document.getElementById("panelLogin");
let displayUsuario = document.getElementById("nombreUsuario");

let usuario = ""
let APIKey = ""
let proyectos = []
let tareasPorProyecto = []


let tablaProyectos = document.getElementById("tablaProyectos");
let tablaUsuarios = document.getElementById("tablaUsuarios");
let tablaTareasPorDuracion = document.getElementById("tablaTareasPorDuracion");
let tablaTareasNuevas = document.getElementById("tablaTareasNuevas");
let tablaTareasPorProyecto = document.getElementById("tablaTareasPorProyecto");
let tablaHoras = document.getElementById("tablaHoras");

let selectorProyecto = document.getElementById("selectorProyecto");
let selectorUsuario = document.getElementById("selectorUsuario");

let indexPaginaActiva = 0
let mainButtons = document.getElementsByClassName("main-button");
let divsMain = document.getElementsByClassName("main");

const baseURL = "http://localhost:8080/api/v3/";

document.addEventListener("DOMContentLoaded", () => {
        let apikey = localStorage.getItem("APIKey");
        if (apikey) {
            iniciarSesion(apikey);
        }
        let indice = parseInt(localStorage.getItem("indexPaginaActiva"));
        if (indice) {
            cambiarMain(indice);
        }

        // Initialize tab system
        let activeTabIndex = parseInt(localStorage.getItem("activeTabIndex"));
        if (!isNaN(activeTabIndex)) {
            cambiarTab(activeTabIndex);
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
    CargarTareasPorDuracion();
    CargarTareasMasNuevas();
    CargarTareasPorProyecto();
    CargarHorasPorUsuario();
}

function MoverPanelLogin() {

    panelLogin.classList.toggle("mover");

}

async function CargarProyectos() {
    let data = await HacerPeticion("projects", APIKey);
    if (data == null) return;
    tablaProyectos.innerHTML = ""
    for (let proyectoIndex in data._embedded.elements) {
        tablaProyectos.innerHTML += `<tr><td>${data._embedded.elements[proyectoIndex].name}</td></tr>`
    }

}

async function CargarUsuarios() {
    let data = await HacerPeticion("users", APIKey);
    if (data == null) return;

    tablaUsuarios.innerHTML = ""
    for (let userIndex in data._embedded.elements) {
        let usuarioData = data._embedded.elements[userIndex]
        tablaUsuarios.innerHTML += `<tr><td>${usuarioData.login}</td><td>${usuarioData.firstName}</td><td>${usuarioData.lastName}</td></tr>`
    }

}

async function CargarTareasPorDuracion() {
    let data = await HacerPeticion('work_packages?sortBy=[["duration","desc"]]', APIKey);
    if (data == null) return;

    tablaTareasPorDuracion.innerHTML = ""
    for (let tareaIndex in data._embedded.elements) {
        let tareaData = data._embedded.elements[tareaIndex]
        tablaTareasPorDuracion.innerHTML += `<tr><td>${tareaData.subject}</td><td>${tareaData.duration}</td><td>${tareaData.startDate}</td><td>${tareaData.date}</td></tr>`
    }
}

async function CargarTareasMasNuevas() {
    let data = await HacerPeticion('work_packages?sortBy=[["createdAt","desc"]]', APIKey);
    if (data == null) return;
    tablaTareasNuevas.innerHTML = ""
    for (let tareaIndex in data._embedded.elements) {
        let tareaData = data._embedded.elements[tareaIndex]
        tablaTareasNuevas.innerHTML += `<tr><td>${tareaData.subject}</td><td>${tareaData.createdAt}</td></tr>`
    }
}

async function CargarTareasPorProyecto() {
    let data = await HacerPeticion('work_packages?groupBy=project', APIKey);
    if (data == null) return;

    for (let grupo in data.groups) {
        let proyecto = data.groups[grupo].value
        proyectos.push(proyecto)
        tareasPorProyecto.push([])
        selectorProyecto.innerHTML += `<option value='${proyecto}'>${proyecto}</option>`
    }

    tablaTareasPorProyecto.innerHTML = ""
    for (let tareaIndex in data._embedded.elements) {
        let tareaData = data._embedded.elements[tareaIndex]
        tareasPorProyecto[proyectos.indexOf(tareaData._links.project.title)].push(tareaData)
    }

    cargarTareasPorProyecto(proyectos[0])

}

function cargarTareasPorProyecto(nombreProyecto) {
    let proyectoKey = proyectos.indexOf(nombreProyecto)

    tablaTareasPorProyecto.innerHTML = ""
    for (let tareaPorProyectoKey in tareasPorProyecto[proyectoKey]) {
        let tareaData = tareasPorProyecto[proyectoKey][tareaPorProyectoKey]
        tablaTareasPorProyecto.innerHTML += `<tr>
                <td>${tareaData.subject}</td>
                <td>${proyectos[proyectoKey]}</td>
            </tr>`
    }

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

    console.log(horasDiccionario)
    Object.keys(horasDiccionario).forEach(key => {
        selectorUsuario.innerHTML += `<option value='${key}'>${key}</option>`
    })
    cargarHorasPorUsuario(Object.keys(horasDiccionario)[0])
}

function cargarHorasPorUsuario(value) {
    tablaHoras.innerHTML = ""
    horasDiccionario[value].forEach(element => {
        tablaHoras.innerHTML += `<tr><td>${element._links.workPackage.title}</td><td>${FormtearDuracion(element.hours)}</td><td>${FormtearDuracion(element._links.project.title)}</td></tr>`
    })

}

function FormtearDuracion(duracion) {
    let d = duracion.replace("PT", "")
    d = d.replace("H", " horas")
    return d
}


function cambiarMain(i) {
    indexPaginaActiva = i;
    for (let divsMainKey = 0;
         divsMainKey < divsMain.length;
         divsMainKey++
    ) {
        divsMain[divsMainKey].classList.remove("active");
        mainButtons[divsMainKey].classList.remove("active");
    }
    divsMain[i].classList.add("active");
    mainButtons[i].classList.add("active");
    localStorage.setItem("indexPaginaActiva", indexPaginaActiva)
}

function CerrarSesion() {
    localStorage.setItem("APIKey", "")
    APIKey = ""
    panelLogin.classList.toggle("mover");
}

// Tab system functionality
function cambiarTab(tabIndex) {
    // Get all tab buttons and tab content elements
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Remove active class from all buttons and contents
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });

    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    // Add active class to the selected button and content
    tabButtons[tabIndex].classList.add('active');
    tabContents[tabIndex].classList.add('active');

    // Optionally save the active tab index to localStorage
    localStorage.setItem('activeTabIndex', tabIndex);
}
