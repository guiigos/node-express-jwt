var express 			= require('express');
var expressValidator 	= require('express-validator');
var bodyParser  		= require('body-parser');
var morgan      		= require('morgan');
var mongoose    		= require('mongoose');
var jwt    				= require('jsonwebtoken');
var app         		= express();

var cors = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
    next()
}

app.use(cors);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressValidator());
app.use(morgan('dev')); // registrar solicitações no console

app.set('tokenSecret', 'magica');

// ---------------------------------------------------------
// routes
// ---------------------------------------------------------
app.get('/', function(req, res) {
	res.send('http://localhost:' + port + '/api');
});

// ---------------------------------------------------------
// Obter uma instância de rotas para api
// ---------------------------------------------------------
var apiRoutes = express.Router(); 

// ---------------------------------------------------------
// autenticação
// ---------------------------------------------------------
apiRoutes.post('/authenticate', function(req, res) {
	req.assert('user', 'Usuário é obrigatório.').notEmpty();
    req.assert('password', 'Senha é obrigatória.').notEmpty();

	var erros = req.validationErrors();
    if (erros) res.json(erros);
	else {
		if (req.body.user == 'guilherme' && req.body.password == '123456') {
			jwt.sign({ 
									'usuario': req.body.user,
									'password': req.body.password
								}, app.get('tokenSecret'), {
									expiresIn: 86400 // 24 horas
								},
                                (token) => res.json({
                                    'token': token,  
                                    'usuario': req.body.user
                                }));
		} else res.json({ success: false, message: 'Authentication failed.' });
	}
});

// ---------------------------------------------------------
// autenticar e verificar o token
// ---------------------------------------------------------
apiRoutes.use(function(req, res, next) {
	var token = req.body.token || req.param('token') || req.headers['x-access-token'];
	if (token) {
		jwt.verify(token, app.get('tokenSecret'), (err, decoded) => {			
			if (err) return res.json({ success: false, message: 'Failed to authenticate token.' });		
			else {
				req.decoded = decoded;	
				next();
			}
		});
	} else {
		return res.status(403).send({ 
			success: false, 
			message: 'No token provided.'
		});
	}
});

// ---------------------------------------------------------
// rotas autenticadas
// ---------------------------------------------------------
apiRoutes.get('/', function(req, res) {
	res.json({ message: 'Bem vindo!' });
});


app.use('/api', apiRoutes);

var port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`Server iniciado em http://localhost:${port}.`));