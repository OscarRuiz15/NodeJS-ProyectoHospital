const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const SEED = require('../config/config').SEED;

const app = express();


// Google
const CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// =========================================
// Autenticacion de Google
// =========================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    //return payload;
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
        payload: payload
    }
}

//verify().catch(console.error);

app.post('/google', async (request, response, next) => {

    const token = request.body.token;
    const googleUser = await verify(token)
        .catch(error => {
            return response.status(403).json({
                ok: false,
                mensaje: 'Token no válido',
            })
        });

    Usuario.findOne({email: googleUser.email}, (error, usuarioDB) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: error
            })
        }

        if (usuarioDB) {
            if (!usuarioDB.google) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticación normal'
                })
            } else {
                const token = jwt.sign({usuario: usuarioDB}, SEED, {expiresIn: 14400}); // 4 horas

                response.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                })
            }
        } else {
            // El usuari no existe... Hay que crearlo
            const usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((error, usuarioDB) => {
                if (error) {
                    return response.status(400).json({
                        ok: false,
                        mensaje: 'Error creando usuario',
                        errors: error
                    });
                }

                const token = jwt.sign({usuario: usuarioDB}, SEED, {expiresIn: 14400}); // 4 horas
                response.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                })
            });
        }
    })
})

// =========================================
// Autenticacion normal
// =========================================
app.post('/', (request, response, next) => {
    const body = request.body;

    Usuario.findOne({email: body.email}, (error, usuarioDB) => {

        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: error
            })
        }

        if (!usuarioDB) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: error
            })
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: error
            })
        }

        // Crear un token !!!
        usuarioDB.password = ':)';
        const token = jwt.sign({usuario: usuarioDB}, SEED, {expiresIn: 14400}); // 4 horas

        response.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        })
    })
})


module.exports = app;
