// Requires (Importacion de librerias)
const express = require('express');
const fileUpload = require('express-fileupload');
const Usuario = require('../models/usuario');
const Medico = require('../models/medico');
const Hospital = require('../models/hospital');
const fs = require('fs');

// Inicializar variables
const app = express();

// default options
app.use(fileUpload());

// Rutas
app.put('/:tipo/:id', (request, response, next) => {

    const tipo = request.params.tipo;
    const id = request.params.id;

    // Tipos de colección
    const tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return response.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no válida',
            errores: {message: 'Los tipos de colección válidos son ' + tiposValidos.join(', ')}
        })
    }

    if (!request.files) {
        return response.status(400).json({
            ok: false,
            mensaje: 'No seleccionó nada',
            errores: {message: 'Debe de seleccionar una imagen'}
        })
    }

    // Obtener nombre del archivo
    const archivo = request.files.imagen;
    const nombreCortado = archivo.name.split('.');
    const extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Solo estas extensiones aceptamos
    const extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return response.status(400).json({
            ok: false,
            mensaje: 'Extensión no válida',
            errores: {message: 'Las extensiones válidas son ' + extensionesValidas.join(', ')}
        })
    }

    // Nombre de archivo personalizado
    const nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    //Mover el archivo del temporal a un path
    const path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, error => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: error
            })
        }

        subirPorTipo(tipo, id, nombreArchivo, path, response);
    })
})

function subirPorTipo(tipo, id, nombreArchivo, path, response) {

    if (tipo === 'usuarios') {
        Usuario.findById(id, (error, usuario) => {

            if (!usuario) {
                return response.status(400).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: {message: 'Usuario no existe'}
                })
            }

            const pathViejo = './uploads/usuarios/' + usuario.img;
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            usuario.img = nombreArchivo;

            usuario.save((error, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                return response.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                })
            })
        })
    }

    if (tipo === 'medicos') {
        Medico.findById(id, (error, medico) => {

            if (!medico) {
                return response.status(400).json({
                    ok: true,
                    mensaje: 'Medico no existe',
                    errors: {message: 'Medico no existe'}
                })
            }

            const pathViejo = './uploads/medicos/' + medico.img;
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            medico.img = nombreArchivo;

            medico.save((error, medicoActualizado) => {
                return response.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                })
            })
        })
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (error, hospital) => {

            if (!hospital) {
                return response.status(400).json({
                    ok: true,
                    mensaje: 'Hospital no existe',
                    errors: {message: 'Hospital no existe'}
                })
            }

            const pathViejo = './uploads/hospitales/' + hospital.img;
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }

            hospital.img = nombreArchivo;

            hospital.save((error, hospitalActualizado) => {
                return response.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                })
            })
        })
    }
}

module.exports = app;
