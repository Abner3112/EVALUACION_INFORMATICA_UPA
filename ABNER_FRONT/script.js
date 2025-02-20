// ----------------------------------      PARA EL PUNTEO                     -------------------------------
document.getElementById("punteo")?.addEventListener("submit", function (event) {
    event.preventDefault();
    enviarPunteo();
});
function enviarPunteo() {
    const punteo_correo = document.getElementById("correo").value;
    const punteo_numero = document.getElementById("numero").value;


    let validar = true;

    if (!validarCorreo(punteo_correo)) {
        document.getElementById("errorCorreo").textContent = "El Correo es incorrecto.";
        validar = false;
    } else {
        document.getElementById("errorCorreo").textContent = "";
    }

    if (!validarNumero(punteo_numero)) {
        document.getElementById("errorNumero").textContent = "Solo numeros.";
        validar = false;
    } else {
        document.getElementById("errorNumero").textContent = "";
    }

    if (validar) {
        fetch("http://localhost:3000/guardar_punteo", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                punteo_correo,
                punteo_numero
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById("Error").textContent = data.error;
            } else {
                document.getElementById("Exito").textContent = `PUNTEO GUARDADO`;
            }
        })
        .catch(error => {
            document.getElementById("Error").textContent = "Error al enviar el PUNTEO.";
        });
    }
}
function validarCorreo(correo) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
}

function validarNumero(numero) {
    const regex = /^[0-9]+$/;
    return regex.test(numero);
}
// ----------------------------------      PARA EL FORMULARIO                  -------------------------------
// Función para validar el nombre (solo letras)
function validarNombre(nombre) {
    const regex = /^[a-zA-Z\s]+$/;
    return regex.test(nombre);
}

// Función para validar el teléfono (solo números)
function validarTelefono(telefono) {
    const regex = /^[0-9]+$/;
    return regex.test(telefono);
}

// Función para validar la fecha de nacimiento (formato dd-mm-YYYY)
function validarFecha(fecha) {
    const regex = /^\d{2}-\d{2}-\d{4}$/;
    return regex.test(fecha);
}

// Función para calcular la edad
function calcularEdad(fechaNacimiento) {
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento.split("-").reverse().join("-"));
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
    }
    return edad;
}

// Función para validar el correo electrónico
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Función para manejar el envío del formulario
function enviarFormulario() {
    const nombre = document.getElementById("nombre").value;
    const fechaNacimiento = document.getElementById("fechaNacimiento").value;
    const telefono = document.getElementById("telefono").value;
    const email = document.getElementById("email").value;

    let valido = true;

    if (!validarNombre(nombre)) {
        document.getElementById("errorNombre").textContent = "El nombre solo puede contener letras.";
        valido = false;
    } else {
        document.getElementById("errorNombre").textContent = "";
    }

    if (!validarFecha(fechaNacimiento)) {
        document.getElementById("errorFecha").textContent = "Formato de fecha inválido. Use dd-mm-YYYY.";
        valido = false;
    } else {
        document.getElementById("errorFecha").textContent = "";
    }

    if (!validarTelefono(telefono)) {
        document.getElementById("errorTelefono").textContent = "El teléfono solo puede contener números.";
        valido = false;
    } else {
        document.getElementById("errorTelefono").textContent = "";
    }

    if (!validarEmail(email)) {
        document.getElementById("errorEmail").textContent = "Correo electrónico inválido.";
        valido = false;
    } else {
        document.getElementById("errorEmail").textContent = "";
    }

    if (valido) {
        const edad = calcularEdad(fechaNacimiento);
        document.getElementById("edad").value = edad;

        fetch("http://localhost:3000/guardar_usuario", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre,
                fecha: fechaNacimiento,
                telefono,
                correo: email,  // Cambiado de 'email' a 'correo'
                edad
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById("mensajeError").textContent = data.error;
            } else {
                document.getElementById("mensajeExito").textContent = `Usuario guardado con éxito. ID: ${data.id}`;
            }
        })
        .catch(error => {
            document.getElementById("mensajeError").textContent = "Error al enviar el formulario.";
        });
    }
}

// Mostrar reportes desde el html
function obtenerReporte(reporte) {
    fetch(`http://localhost:3000/ejecutar_reporte/${reporte}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al obtener los datos del reporte.");
            }
            return response.json();
        })
        .then(data => {
            let contenido = "<h2>Resultados del Reporte:</h2><ul>";
            if (data.length === 0) {
                contenido += "<li>No hay datos para este reporte.</li>";
            } else {
                data.forEach(item => {
                    contenido += `<li>ID: ${item.id}, Nombre: ${item.nombre}, Teléfono: ${item.telefono}</li>`;
                });
            }
            contenido += "</ul>";
            document.getElementById("contenidoReporte").innerHTML = contenido;
        })
        .catch(error => {
            console.error("Error al obtener el reporte:", error);
            document.getElementById("contenidoReporte").innerHTML = `
                <p style="color: red;">Error al obtener el reporte: ${error.message}</p>
            `;
        });
}

document.getElementById("fechaNacimiento")?.addEventListener("input", function () {
    const fechaNacimiento = this.value;
    if (validarFecha(fechaNacimiento)) {
        const edad = calcularEdad(fechaNacimiento);
        document.getElementById("edad").value = edad;
    } else {
        document.getElementById("edad").value = 0;
    }
});

document.getElementById("formulario")?.addEventListener("submit", function (event) {
    event.preventDefault();
    enviarFormulario();
});