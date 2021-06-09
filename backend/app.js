
require('module-alias/register');
require('src/database.js');
require('src/mail.js');

const express = require('express');
const bodyParser = require('body-parser');

const config = require('@root/config.js');
const { importFullArchive } = require ('src/archives.js');
const Message = require('src/models/Message.js');

// Routes
const messages = require('src/routes/messages.js');
const status = require('src/routes/status.js');

// Server config
const app = express();
app.set('port', config.PORT || 8080);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/messages', messages);
app.use('/api/status', status);

app.listen(app.get('port'), () => {
	console.log(`Node app is running on port ${app.get('port')}`);
});

// For testing purposes

console.time("import");
importFullArchive()
.then(() => {
	console.timeEnd("import");
	Message
		.find({})
		.then(data => console.log(data.length));
});

/*
Message
	.find({ 'from.name': 'befreeandopen' })
	.then(data => console.log(JSON.stringify(data, null, 4)));*/
