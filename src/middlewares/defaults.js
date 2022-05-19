const httpStatus = require('http-status');

const notFound = (req, res, next) => {
  res
    .status(httpStatus.NOT_FOUND)
    .send('Page not found!');

  next();
};

const paymentRequired = (err, req, res, next) => {
  if (Object.keys(err).includes('array')) {
    const { array } = err;

    res
      .status(httpStatus.PAYMENT_REQUIRED)
      .json({
        validation: array({ onlyFirstError: true }),
      });

    return;
  }

  next(err);
};

const internalServerError = (err, req, res, next) => {
  res
    .status(httpStatus.INTERNAL_SERVER_ERROR)
    .send(`Unidentified Error - ${err.message}`);

  next();
};

module.exports = (application) => {
  application.use(notFound);
  application.use(paymentRequired);
  application.use(internalServerError);
};
