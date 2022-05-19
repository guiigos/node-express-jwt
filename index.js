const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const faker = require('faker');
const cors = require('cors');

const authentication = require('./src/routes/authentication');
const router = require('./src/routes/router');
const defaults = require('./src/middlewares/defaults');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());

app.set('jwt-options', Object.freeze({ expiresIn: '1h' }));
app.set('jwt-secret', faker.lorem.word());
app.set('username', faker.internet.email());
app.set('password', faker.internet.password());

authentication(app);
router(app);
defaults(app);

app.listen(Number(process.env.PORT || 3030));
