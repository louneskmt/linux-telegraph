const mongoose = require('mongoose');
const config = require('@root/config.js');

class Connection {
    constructor() {
        const url = `mongodb://${config.MONGODB_IP}:${config.MONGODB_PORT}/bitcoin-dev`;

        console.log("Establish new connection with url", url);
        mongoose.Promise = global.Promise;
        mongoose.set("useNewUrlParser", true);
        mongoose.set("useFindAndModify", false);
        mongoose.set("useCreateIndex", true);
        mongoose.set("useUnifiedTopology", true);
        mongoose.connect(url);
    }
}

module.exports = new Connection();