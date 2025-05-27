let baseURL = "http://localhost:8080/api/v3/"
let APIKey = "091e1f83506776fabe7e09362b290ec6a80e571ef650fd677fa2a7acbd9876b6"

async function HacerPeticion(url) {
    try {
        const response = await fetch(baseURL + url, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + btoa(`apikey:${APIKey}`), // btoa codifica a Base64
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

let listaProyectosPorNombre = document.getElementById("listaProyectosPorNombre")

let entradasOrdenadasPorFechaCreacion = document.getElementById("entradasOrdenadasPorFechaCreacion")
let entradasOrdenadasPorHoras = document.getElementById("entradasOrdenadasPorHoras")
let entradasFiltradasPorProyecto = document.getElementById("entradasFiltradasPorProyecto")
let selectUsuario = document.getElementById("selectUsuario")
let entradasPorUsuario = document.getElementById("entradasPorUsuario")

async function CargarDatos() {
    let datos

    datos = await HacerPeticion('projects?filters=[{ "name": { "operator": "~", "values": ["proyectazo"] } }]')
    console.log(datos._embedded.elements)

    datos._embedded.elements.forEach(element => {
        listaProyectosPorNombre.innerHTML += `
            <p>${element.name}</p>
        `
    })


    datos = await HacerPeticion('work_packages?sortBy=[["createdAt","desc"]]&pageSize=5')
    datos._embedded.elements.forEach(element => {
        entradasOrdenadasPorFechaCreacion.innerHTML += `
            <p>${element.subject} - ${element.createdAt}</p>
        `
    })

    datos = await HacerPeticion('work_packages?sortBy=[["duration","desc"]]&pageSize=5&filters=[{ "duration": { "operator": "!", "values": ["0"] }}]')
    datos._embedded.elements.forEach(element => {
        entradasOrdenadasPorHoras.innerHTML += `
            <p>${element.subject} - ${element.duration}</p>
        `
    })

    datos = await HacerPeticion('projects/13/work_packages?pageSize=5')

    datos._embedded.elements.forEach(element => {
        entradasFiltradasPorProyecto.innerHTML += `
            <p>${element.subject} - ${element._links.project.title}</p>
        `
    })

    datos = await HacerPeticion('users')

    datos._embedded.elements.forEach(element => {
        selectUsuario.innerHTML += `
            <option value="${element.id}">${element.login}</option>
        `
    })
}

async function FiltrarPorUsuario() {
    let usuario = selectUsuario.value
    entradasPorUsuario.innerHTML = ""
    let datos = await HacerPeticion(`time_entries?filters=[{ "user": { "operator": "=", "values":[ "${usuario}" ]} }]`)

    datos._embedded.elements.forEach(element => {
        entradasPorUsuario.innerHTML += `
            <p>${element._links.user.title} - ${element.hours} - ${element._links.project.title}</p>
        `
    })
}


CargarDatos()