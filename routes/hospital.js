const express = require('express');
const Hospital = require('../models/hospital');
const mdAutenticacion = require('../middlewares/autenticacion');

const app = express();

app.get('/', (request, response, next) => {
    let desde = request.query.desde || 0;
    desde = Number(desde);
    Hospital.find({}, 'nombre img usuario')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((error, hospitales) => {
            if (error) {
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors: error
                });
            }

            Hospital.count({}, (error, conteo) => {
                response.status(200).json({
                    ok: true,
                    total: conteo,
                    hospitales: hospitales
                });
            })
        })
})

app.post('/', mdAutenticacion.verificaToken, (request, response, next) => {
    const body = request.body;

    const hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: body.usuario
    })

    hospital.save((error, hospitalGuardado) => {
        if (error) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error creando hospital',
                errors: error
            });
        }

        response.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    })
})

app.put('/:id', mdAutenticacion.verificaToken, (request, response, next) => {
        const id = request.params.id;
        const body = request.body;
        Hospital.findById(id, (error, hospital) => {
            if (error) {
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: error
                });
            }

            if (!hospital) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + ' no existe',
                    errors: {message: 'No existe un hospital con ese ID'}
                });
            }

            hospital.nombre = body.nombre;
            hospital.usuario = body.usuario;

            hospital.save((error, hospitalGuardado) => {
                if (error) {
                    return response.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar hospital',
                        errors: error
                    });
                }

                response.status(200).json({
                    ok: true,
                    hospital: hospitalGuardado
                });
            })
        })
    }
)

app.delete('/:id', mdAutenticacion.verificaToken, (request, response, next) => {
    const id = request.params.id;
    Hospital.findByIdAndRemove(id, (error, hospitalBorrado) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: error
            });
        }

        if (!hospitalBorrado) {
            return response.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: {message: 'No existe un hospital con ese id'}
            });
        }

        response.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    })
})

module.exports = app;
