const path = require('path');
require('dotenv').config({ path: `${process.env.DATADIR || '~/.bitcoin-dev'}/.env` });

if(process.env.MAIL_TLS === "true") process.env.MAIL_TLS = true;
else process.env.MAIL_TLS = false;

module.exports = {
    MODE: 'production',
    PORT: process.env.PORT || 5000,
    MONGODB_IP: process.env.MONGODB_IP || 'mongo',
    MONGODB_PORT: process.env.MONGODB_PORT || '27017',
    MAILINGLIST: process.env.MAILINGLIST || 'bitcoin-dev',
    DATADIR: process.env.DATADIR || '~/.bitcoin-dev',
    mailConfig: {
        user: process.env.MAIL_ADDRESS,
        password: process.env.MAIL_PASSWORD,
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        tls: process.env.MAIL_TLS || false,
        tlsOptions: { rejectUnauthorized: false, servername: process.env.MAIL_HOST }
    }
};