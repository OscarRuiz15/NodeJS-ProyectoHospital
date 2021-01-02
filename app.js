// Requires (Importacion de librerias)
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Inicializar variables
const app = express();

// CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

// Body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// Server index config
/*const serveIndex = require('serve-index')
app.use(express.static(__dirname + '/'))
app.use('/uploads', serveIndex(__dirname + '/uploads'));*/


// Importar rutas
const appRoutes = require('./routes/app')
const usuarioRoutes = require('./routes/usuario')
const loginRoutes = require('./routes/login')
const hospitalRoutes = require('./routes/hospital')
const medicoRoutes = require('./routes/medico')
const busquedaRouter = require('./routes/busqueda')
const uploadRouter = require('./routes/upload')
const imagenesRouter = require('./routes/imagenes')

// Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (error, response) => {
    if (error) throw error;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
})

// Rutas
app.use('/usuario', usuarioRoutes)
app.use('/hospital', hospitalRoutes)
app.use('/medico', medicoRoutes)
app.use('/login', loginRoutes)
app.use('/busqueda', busquedaRouter)
app.use('/upload', uploadRouter)
app.use('/img', imagenesRouter)
app.use('/', appRoutes)

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
})
