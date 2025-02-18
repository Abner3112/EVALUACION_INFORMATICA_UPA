// Importar módulos necesarios
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

// Inicializar aplicación Express
const app = express();
const port = 3000;

// Configurar la conexión a la base de datos
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "evaluacion_abner"
});

// Conectar a la base de datos
connection.connect((err) => {
    if (err) {
        console.error("❌ Error conectando a la base de datos:", err);
        process.exit(1);
    }
    console.log("✅ Conectado a la base de datos MySQL");
});

// Middleware para parsear JSON
app.use(express.json());

// Habilitar CORS para permitir conexiones desde el frontend
app.use(cors());

// Servir archivos estáticos (HTML, CSS, JS) desde la carpeta ABNER_FRONT
const frontPath = path.join(__dirname, "../ABNER_FRONT");
app.use(express.static(frontPath));

// Ruta principal para servir el index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(frontPath, "index.html"));
});

// ----------------------------------------
// 🟢 RUTA PARA EJECUTAR REPORTES
// ----------------------------------------

app.get("/ejecutar_reporte/:reporte", (req, res) => {
    const { reporte } = req.params;

    if (!reporte) {
        return res.status(400).json({ error: "Código de reporte no proporcionado." });
    }

    let query;
    switch (reporte) {
        case "todos_usuarios":
            query = `
                SELECT u.id, u.nombre, u.telefono, u.correo, u.creacion, e.titulo AS estado
                FROM usuario u
                INNER JOIN estadousuario e ON u.EstadoUsuarioId = e.id
            `;
            break;
        case "usuarios_creados_hoy":
            query = `
                SELECT u.id, u.nombre, u.telefono, u.correo, u.creacion, e.titulo AS estado
                FROM usuario u
                INNER JOIN estadousuario e ON u.EstadoUsuarioId = e.id
                WHERE DATE(u.creacion) = CURDATE()
            `;
            break;
        case "usuarios_creados_ayer":
            query = `
                SELECT u.id, u.nombre, u.telefono, u.correo, u.creacion, e.titulo AS estado
                FROM usuario u
                INNER JOIN estadousuario e ON u.EstadoUsuarioId = e.id
                WHERE DATE(u.creacion) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
            `;
            break;
        default:
            return res.status(404).json({ error: "Código de reporte no válido." });
    }

    connection.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error en la consulta:", err);
            return res.status(500).json({ error: "Error al ejecutar el reporte." });
        }
        res.status(200).json(results);
    });
});
// ----------------------------------------
// 🔵 RUTA PARA GUARDAR USUARIO
// ----------------------------------------

app.post("/guardar_usuario", (req, res) => {
    const { nombre, fecha, telefono, correo } = req.body;

    console.log("Datos recibidos:", req.body);

    // 🔹 Validar que todos los campos son obligatorios
    if (!nombre || !fecha || !telefono || !correo) {
        return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    // 🔹 Validar que el nombre solo contenga letras
    if (!/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/.test(nombre)) {
        return res.status(400).json({ error: "El nombre solo puede contener letras y espacios." });
    }

    // 🔹 Validar que el teléfono solo contenga números y tenga entre 8 y 15 dígitos
    if (!/^\d{8,15}$/.test(telefono)) {
        return res.status(400).json({ error: "El teléfono solo puede contener entre 8 y 15 dígitos numéricos." });
    }

    // 🔹 Validar el formato de fecha "dd-mm-YYYY"
    if (!/^\d{2}-\d{2}-\d{4}$/.test(fecha)) {
        return res.status(400).json({ error: "El formato de fecha debe ser 'dd-mm-YYYY'." });
    }

    // 🔹 Convertir fecha de "dd-mm-YYYY" a formato Date
    const [day, month, year] = fecha.split("-").map(Number);
    const fechaNacimiento = new Date(year, month - 1, day);

    // 🔹 Validar que el usuario sea mayor de edad
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    if (hoy.getMonth() < fechaNacimiento.getMonth() || 
        (hoy.getMonth() === fechaNacimiento.getMonth() && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
    }
    if (edad < 18) {
        return res.status(400).json({ error: "El usuario debe ser mayor de edad para registrarse." });
    }

    // 🔹 Validar formato de correo
    if (!/^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/.test(correo)) {
        return res.status(400).json({ error: "El formato del correo electrónico no es válido." });
    }

    // 🔹 Si pasa la validación, se inserta en la BD
    const query = `
        INSERT INTO usuario (nombre, fecha, telefono, correo, creacion, EstadoUsuarioId)
        VALUES (?, ?, ?, ?, NOW(), 1)
    `;
    const valores = [nombre, fecha, telefono, correo];

    connection.query(query, valores, (err, result) => {
        if (err) {
            console.error("❌ Error al guardar el usuario:", err);
            return res.status(500).json({ error: "Error al guardar el usuario." });
        }
        res.status(201).json({ mensaje: "✅ Usuario guardado exitosamente", id: result.insertId });
    });
});

// ----------------------------------------
// 🚀 INICIAR SERVIDOR
// ----------------------------------------

app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en: http://localhost:${port}`);
});


