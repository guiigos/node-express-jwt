const router = require('express').Router;
const handlers = require('../helper/handlers');
const authenticated = require('../middlewares/authenticated');

module.exports = (application) => {
  const a = router();
  a.get('/opened', handlers.success);
  a.get('/closeded', authenticated(application), handlers.success);

  const b = router();
  b.use(authenticated(application));
  b.get('/closeded', handlers.success);

  const c = router();
  c.get('/closeded', handlers.success);

  const root = router();
  root.use('/a', a);
  root.use('/b', b);
  root.use('/c', authenticated(application), c);

  application.use(root);
};

