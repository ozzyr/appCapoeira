const mongoose = require('mongoose');
const config = require('./db');

mongoose.connect(config.DB, { useNewUrlParser: true }).then(
    () => {console.log('Database is connected') },
    err => { console.log('Can not connect to the database'+ err)}
);

mongoose.Promise = global.Promise;
module.exports = mongoose;
