// Requires (Importacion de librerias)
const express = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario')
const mdAutenticacion = require('../middlewares/autenticacion');

// Inicializar variables
const app = express();

// Rutas

// =========================================
// Obtener todos los usuarios
// =========================================
app.get('/', (request, response, next) => {
    let desde = request.query.desde || 0;
    desde = Number(desde);
    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec((error, usuarios) => {
            if (error) {
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuarios',
                    errors: error
                });
            }

            Usuario.count({}, (error, conteo) => {
                response.status(200).json({
                    ok: true,
                    total: conteo,
                    usuarios: usuarios
                });
            })
        });
})


// =========================================
// Crear un nuevo usuario
// =========================================
app.post('/', (request, response, next) => {
    const body = request.body;

    const usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((error, usuarioGuardado) => {
        if (error) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error creando usuario',
                errors: error
            });
        }

        response.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: request.usuario
        });
    });
})

// =========================================
// Actualizar un usuario
// =========================================
app.put('/:id', mdAutenticacion.verificaToken, (request, response, next) => {
    const id = request.params.id;
    const body = request.body;
    Usuario.findById(id, (error, usuario) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: error
            });
        }

        if (!usuario) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: {message: 'No existe un usuario con ese ID'}
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((error, usuarioGuardado) => {
            if (error) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: error
                });
            }

            usuarioGuardado.password = ':)';

            response.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        })
    })
})

// =========================================
// Borrar un usuario por el id
// =========================================
app.delete('/:id', mdAutenticacion.verificaToken, (request, response, next) => {
    var id = request.params.id;
    Usuario.findByIdAndRemove(id, (error, usuarioBorrado) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: error
            });
        }

        if (!usuarioBorrado) {
            return response.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id',
                errors: {message: 'No existe un usuario con ese id'}
            });
        }

        response.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    })
})

module.exports = app;
