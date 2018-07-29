const express = require('express');
const bodyParser = require('body-parser');

const port = 3005;
const app = express();
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

require('./controllers/authController')(app);

app.listen(port);
console.log(`subiu na porta ${port}`)