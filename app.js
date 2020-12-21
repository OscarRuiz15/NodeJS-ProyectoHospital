// Requires (Importacion de librerias)
const express = require('express');
const mongoose = require('mongoose');

// Inicializar variables
const app = express();

// Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (error, response) => {
    if (error) throw error;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
})

// Rutas
app.get('/', (request, response, next) => {
    response.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    })
})

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
})
