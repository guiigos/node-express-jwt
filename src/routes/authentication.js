const jwt = require('jsonwebtoken');
const router = require('express').Router;
const handlers = require('../helper/handlers');
const validator = require('../validators/authentication');

const options = Object.freeze({
  expiresIn: '1h',
});

module.exports = (application) => {
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

    if (username != application.get('username') ||
        password != application.get('password')) {
      return handlers.unauthorized(req, res);
    }

    const payload = {
      username,
      password,
    };

    jwt.sign(payload, application.get('secret'), options, (error, token) => {
      if (error) {
        return handlers.error(req, res, error);
      }

      return handlers.success(req, res, { token });
    });
  };

  const authenticate = router();
  authenticate.get('/', get);
  authenticate.post('/', validator.post, post);
  application.use('/authenticate', authenticate);
};
