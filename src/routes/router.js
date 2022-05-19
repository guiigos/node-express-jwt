const router = require('express').Router;
const handlers = require('../helper/handlers');
const authenticated = require('../middlewares/authenticated');

module.exports = (application) => {
  const a = router();
  a.get('/open', handlers.success);
  a.get('/close', authenticated(application), handlers.success);

  const b = router();
  b.use(authenticated(application));
  b.get('/close', handlers.success);

  const c = router();
  c.get('/close', handlers.success);

  const root = router();
  root.use('/a', a);
  root.use('/b', b);
  root.use('/c', authenticated(application), c);

  application.use(root);
};

