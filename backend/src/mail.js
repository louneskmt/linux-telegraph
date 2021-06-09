const Imap = require('imap');
const moment = require('moment');
const inspect = require('util').inspect;

const config = require('@root/config.js');
const { fetchAndImportArchive } = require ('src/archives.js');

const imap = new Imap(config.mailConfig);

imap.once('ready', function() {
	console.log('Connection to mail server successful.');

	imap.openBox('INBOX', true, function(err, box) {
		if (err) throw err;

		imap.on('mail', function(nb) {
			console.log(`New mail received! (${nb})`);
	
			const currentDate = moment().format('YYYY-MMMM');
			console.log(`Importing updated archive (${currentDate})...`);
			fetchAndImportArchive(currentDate);
		
			/*
			const f = imap.seq.fetch(box.messages.total + ':*', { bodies: ['HEADER.FIELDS (FROM SUBJECT DATE)','TEXT'] });
		
			f.on('message', function(msg, seqno) {
				console.log('Message #%d', seqno);
				const prefix = '(#' + seqno + ') ';

				msg.on('body', function(stream, info) {
					if (info.which === 'TEXT')
						console.log(prefix + 'Body [%s] found, %d total bytes', inspect(info.which), info.size);
			
					let buffer = '';
					stream.on('data', function(chunk) {
						buffer += chunk.toString('utf8');
					});
					stream.once('end', function() {
						if (info.which !== 'TEXT') {
							const headers = Imap.parseHeader(buffer);
							console.log(prefix + `From: ${headers.from}`);
							console.log(prefix + `Date: ${headers.date}`);
							console.log(prefix + `Subject: ${headers.subject}`);							
						} else {
							console.log(buffer);
						}
					});
				});

				msg.once('end', function() {
					console.log(prefix + 'Finished');
				});
			});

			f.once('error', function(err) {
				console.log('Fetch error: ' + err);
			});

			*/
		});
	});
});

imap.once('error', function(err) {
	console.log(err);
});
   
imap.once('end', function() {
	console.log('Connection to mail server ended.');
});
   
imap.connect();