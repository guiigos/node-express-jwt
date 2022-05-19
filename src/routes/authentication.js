const jwt = require('jsonwebtoken');
const router = require('express').Router;
const handlers = require('../helper/handlers');
const validator = require('../validators/authentication');

const get = (req, res, next) => {
  handlers.success(req, res, {
    username: application.get('username'),
    password: application.get('password'),
  });
};

const post = (req, res, next) => {
  const {
    username,
    password,
  } = req.body;

  const hasAccess =
    username != application.get('username') ||
    password != application.get('password');

  if (hasAccess) {
    return handlers.unauthorized(req, res);
  }

  const payload = {
    username,
    password,
  };

  const callback = (error, token) => {
    if (error) {
      return handlers.error(req, res, error);
    }

    return handlers.success(req, res, { token });
  };

  return jwt.sign(payload, application.get('jwt-secret'), application.get('jwt-options'), callback);
};

module.exports = (application) => {
  const authenticate = router();
  authenticate.get('/', get);
  authenticate.post('/', validator.post, post);

  application.use('/authenticate', authenticate);
};
