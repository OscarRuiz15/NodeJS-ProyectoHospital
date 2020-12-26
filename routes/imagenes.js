// Requires (Importacion de librerias)
const express = require('express');

// Inicializar variables
const app = express();

const path = require('path');
const fs = require('fs');

// Rutas
app.get('/:tipo/:img', (request, response, next) => {

    const tipo = request.params.tipo;
    const img = request.params.img;

    const pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`)
    if (fs.existsSync(pathImagen)) {
        response.sendFile(pathImagen);
    } else {
        const pathNoImage = path.resolve(__dirname, '../assets/no-img.jpg')
        response.sendFile(pathNoImage);
    }
})

module.exports = app;
