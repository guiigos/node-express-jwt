'user strict'

var expressValidator = require('express-validator');
var bodyParser = require('body-parser');
var httpStatus = require('http-status');
var morgan = require('morgan');
var cors = require('cors');
var path = require('path');
var jwt = require('jsonwebtoken');

var express = require('express');
var app = express();

// Middleware JWT
var authenticated = function (req, res, next) {
  var token = req.body.token || req.param('token') || req.headers['x-access-token'] || req.headers['authorization'];

  if (!token) {
    return res.status(httpStatus.UNAUTHORIZED).send({ success: false, message: 'Nenhum token informado' });
  }

  // Authorization bearer
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  jwt.verify(token, app.get('secret'), (error, decoded) => {
    if (error) {
      return res.status(httpStatus.UNAUTHORIZED).json({ success: false, message: 'Não foi possivel autenticar' });
    }

    req.decoded = decoded;
    next();
  });
};

// Handler response
var handler = function (req, res, next) {
  res.status(httpStatus.OK).json({ success: true, message: 'Hello!', route: req.baseUrl });
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());

// Workaround
app.set('secret', 'super secret phrase');
app.set('username', 'guilherme');
app.set('password', 'alves');

// Documentation
app.use(express.static(path.join(__dirname, '/doc')));

/**
 * @api {post} /authenticate Request authentication token
 * @apiGroup Authenticate
 * @apiDescription Token is used to access other API routes
 * @apiParam {String} username Access User
 * @apiParam {String} password Access password
 * @apiSampleRequest /authenticate
 */
app.post('/authenticate', [
  expressValidator.check('username').isLength({ min: 1 }).withMessage('Usuário é obrigatório'),
  expressValidator.check('password').isLength({ min: 1 }).withMessage('Senha é obrigatória'),
  expressValidator.sanitize('username').trim(),
  expressValidator.sanitize('password').trim()
], function (req, res, next) {
  var errors = expressValidator.validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({ success: false, validations: errors.array() });
  }

  if (req.body.username != app.get('username') || req.body.password != app.get('password')) {
    res.status(httpStatus.UNAUTHORIZED).json({ success: false, message: 'Não foi possível autenticar', });
  }

  var payload = {
    username: req.body.username,
    password: req.body.password
  };

  var options = {
    expiresIn: '1h'
  };

  jwt.sign(payload, app.get('secret'), options, (error, token) => {
    if (error) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }

    res.status(httpStatus.OK).json({ success: true, token: token });
  });
});

/**
 * @api {get} /api/v1 Request v1
 * @apiGroup Api
 * @apiDescription Request Test Any
 * @apiSampleRequest /api/v1
 */
/**
 * @api {post} /api/v1 Request v1
 * @apiGroup Api
 * @apiDescription Request Test Any
 * @apiHeader {String} authorization Access Token
 * @apiSampleRequest /api/v1
 */
var apiRoutesV1 = express.Router();
apiRoutesV1.get('/', handler);
apiRoutesV1.post('/', authenticated, handler);

/**
 * @api {get} /api/v2 Request v2
 * @apiGroup Api
 * @apiDescription Request Test Any
 * @apiHeader {String} authorization Access Token
 * @apiSampleRequest /api/v2
 */
var apiRoutesV2 = express.Router();
apiRoutesV2.use(authenticated);
apiRoutesV2.get('/', handler);

/**
 * @api {get} /api/v3 Request v3
 * @apiGroup Api
 * @apiDescription Request Test Any
 * @apiSampleRequest /api/v3
 */
var apiRoutesV3 = express.Router();
apiRoutesV3.get('/', handler);

// Router API
var apiRoutes = express.Router();
apiRoutes.use('/v1', apiRoutesV1);
apiRoutes.use('/v2', apiRoutesV2);
apiRoutes.use('/v3', authenticated, apiRoutesV3);
app.use('/api', apiRoutes);

// Server listen
var port = Number(process.env.PORT || 3000);
app.listen(port, function () {
  console.log(`Server listen on port ${port}.`);
});
