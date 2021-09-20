const expressValidator = require('express-validator');

module.exports = {
  post: [
    expressValidator
      .body('username')
      .isLength({ min: 1 })
      .withMessage('Usuário é obrigatório'),
    expressValidator
      .body('password')
      .isLength({ min: 1 })
      .withMessage('Senha é obrigatória'),
    (req, res, next) => {
      expressValidator.validationResult(req).throw();
      next();
    }],
};
