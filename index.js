'user strict'

const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');

const express = require('express');
var app = express();

var cors = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
}

// autenticação utilizando somente o jwt
var _jwt = function (req, res, next) {
    var token = req.body.token || req.param('token') || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, app.get('tokenSecret'), (err, decoded) => {
            if (err) return res.json({ success: false, message: 'Não foi possivel autenticar.' });
            else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'Nenhum token informado.'
        });
    }
};

app.use(cors);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressValidator());
app.use(morgan('dev'));

app.set('tokenSecret', 'guilherme@alves');
app.set('usuario', 'guilherme');
app.set('senha', '123456');

app.get('/', function (req, res) {
    res.send(`
        <h1>Exemplo de autenticação via token</h1>
        <br>
        <ul>
            <li>
                <p><strong>POST</strong> autenticação rota <strong><a href="http://localhost:${port}/authenticate">Authenticate</a></strong>
                <br>
                <strong>Usuário:</strong> ${app.get('usuario')} <strong>Senha:</strong> ${app.get('senha')}</p>
            </li>
            <li>
                <p><strong>GET</strong> rotas autenticadas <strong><a href="http://localhost:${port}/api">API</a></strong></p>
            </li>
        </ul>
    `);
});

app.post('/authenticate', function (req, res) {
    req.assert('user', 'Usuário é obrigatório.').notEmpty();
    req.assert('password', 'Senha é obrigatória.').notEmpty();

    var erros = req.validationErrors();
    if (erros) res.json(erros);
    else {
        if (req.body.user == app.get('usuario') && req.body.password == app.get('senha')) {

            let payload = {
                'usuario': req.body.user,
                'password': req.body.password
            };

            let options = {
                expiresIn: 86400 // 24 horas
            };

            jwt.sign(payload, app.get('tokenSecret'), options, (token) => {
                res.json({
                    'token': token,
                    'usuario': req.body.user
                });
            });
        } else res.json({ success: false, message: 'Não foi possível autenticar.' });
    }
});

// rotas autenticadas diretamente pelo _jwt
var apiRoutes = express.Router();

apiRoutes.use(_jwt);

apiRoutes.get('/', function (req, res) {
    res.json({ message: 'Bem vindo!' });
});

app.use('/api', apiRoutes);

var port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Server iniciado em http://localhost:${port}.`));