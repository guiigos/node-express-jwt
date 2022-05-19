const jwt = require('jsonwebtoken');
const handlers = require('../helper/handlers');

const authenticated = (application) => (req, res, next) => {
  let token =
    req.body.token ||
    req.param.token ||
    req.headers['x-access-token'] ||
    req.headers['authorization'];

  if (!token) {
    return handlers.unauthorized(req, res);
  }

  jwt.verify(token.replace(/bearer /ig, ''), application.get('secret'), (error, decoded) => {
    if (error) {
      return handlers.unauthorized(req, res);
    }

    req.decoded = decoded;
    return next();
  });
};

module.exports = authenticated;
