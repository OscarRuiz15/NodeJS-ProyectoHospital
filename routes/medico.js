const express = require('express');
const Medico = require('../models/medico');
const mdAutenticacion = require('../middlewares/autenticacion');

const app = express();

app.get('/', (request, response, next) => {
    let desde = request.query.desde || 0;
    desde = Number(desde);
    Medico.find({}, 'nombre img usuario hospital')
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((error, medicos) => {
            if (error) {
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: error
                });
            }

            Medico.count({}, (error, conteo) => {
                response.status(200).json({
                    ok: true,
                    total: conteo,
                    medicos: medicos
                });
            })
        })
})

app.post('/', mdAutenticacion.verificaToken, (request, response, next) => {
    const body = request.body;

    const medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: request.usuario._id,
        hospital: body.hospital
    })

    medico.save((error, medicoGuardado) => {
        if (error) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error creando medico',
                errors: error
            });
        }

        response.status(201).json({
            ok: true,
            hospital: medicoGuardado
        });
    })
})

app.put('/:id', mdAutenticacion.verificaToken, (request, response, next) => {
        const id = request.params.id;
        const body = request.body;
        Medico.findById(id, (error, medico) => {
            if (error) {
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar medico',
                    errors: error
                });
            }

            if (!medico) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'El medico con el id ' + id + ' no existe',
                    errors: {message: 'No existe un medico con ese ID'}
                });
            }

            medico.nombre = body.nombre;
            medico.usuario = request.usuario._id;
            medico.hospital = body.hospital;

            medico.save((error, medicoGuardado) => {
                if (error) {
                    return response.status(400).json({
                        ok: false,
                        mensaje: 'Error al actualizar medico',
                        errors: error
                    });
                }

                response.status(200).json({
                    ok: true,
                    hospital: medicoGuardado
                });
            })
        })
    }
)

app.delete('/:id', mdAutenticacion.verificaToken, (request, response, next) => {
    const id = request.params.id;
    Medico.findByIdAndRemove(id, (error, medicoBorrado) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: error
            });
        }

        if (!medicoBorrado) {
            return response.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                errors: {message: 'No existe un medico con ese id'}
            });
        }

        response.status(200).json({
            ok: true,
            hospital: medicoBorrado
        });
    })
})

module.exports = app;
