// Requires (Importacion de librerias)
const express = require('express');
const Hospital = require('../models/hospital')
const Usuario = require('../models/usuario')
const Medico = require('../models/medico')

// Inicializar variables
const app = express();

// Rutas

// =========================================
// Busqueda por coleccion
// =========================================
app.get('/coleccion/:tabla/:busqueda', (request, response, next) => {
    const tabla = request.params.tabla;
    const busqueda = request.params.busqueda;
    const regex = new RegExp(busqueda, 'i');
    let promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;
        default:
            return response.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda sólo son: usuarios, medicos y hospitales',
                error: {message: 'Tipo de tabla/coleccion no valido'}
            })
    }

    promesa.then(data => {
        response.status(200).json({
            ok: true,
            [tabla]: data,
        })
    })
})

// =========================================
// Busqueda general
// =========================================
app.get('/todo/:busqueda', (request, response, next) => {

    const busqueda = request.params.busqueda;
    const regex = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)])
        .then(respuestas => {
            response.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2],
            })
        })
})

function buscarHospitales(busqueda, regex) {
    return new Promise(((resolve, reject) => {
        Hospital.find({nombre: regex})
            .populate('usuario', 'nombre email')
            .exec((error, hospitales) => {
                if (error) {
                    reject('Error al cargar hospitales', error);
                } else {
                    resolve(hospitales)
                }
            })
    }))
}

function buscarMedicos(busqueda, regex) {
    return new Promise(((resolve, reject) => {
        Medico.find({nombre: regex})
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((error, medicos) => {
                if (error) {
                    reject('Error al cargar medicos', error);
                } else {
                    resolve(medicos)
                }
            })
    }))
}

function buscarUsuarios(busqueda, regex) {
    return new Promise(((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{'nombre': regex}, {'email': regex}])
            .exec((error, usuarios) => {
                if (error) {
                    reject('Error al cargar usuarios', error);
                } else {
                    resolve(usuarios)
                }
            })
    }))
}

module.exports = app;
