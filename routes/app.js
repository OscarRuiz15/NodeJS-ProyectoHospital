// Requires (Importacion de librerias)
const express = require('express');

// Inicializar variables
const app = express();

// Rutas
app.get('/', (request, response, next) => {
    response.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    })
})

module.exports = app;
