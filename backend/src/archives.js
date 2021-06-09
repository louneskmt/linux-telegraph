const fs = require('fs');
const axios = require('axios');
const path = require('path');
const zlib = require("zlib");
const moment = require('moment');

const config = require('@root/config.js');
const Message = require('src/models/Message.js');

async function fetchArchiveFile(date, retries = 5, backoff=500) {
    const options = {
        url: `http://lists.linuxfoundation.org/pipermail/${config.MAILINGLIST}/${date}.txt.gz`,
        method: 'GET',
        responseType: 'stream',
        timeout: 0
    };

    return new Promise((resolve, reject) => {
        const dirpath = path.resolve(config.DATADIR, 'archives');
        const filepath = path.resolve(config.DATADIR, 'archives', `${date}.txt`);

        fs.mkdir(dirpath, (err) => {
            if(err && err.code !== 'EEXIST') {
                throw new Error(`Couldn't create ${config.DATADIR + '/archives'}: ${err}`);
            } else {
                fs.readFile(filepath, 'utf8', (err, str) => {
                    if (err || date == moment().format('YYYY-MMMM')) {
                        if(retries == 5) console.log(`Downloading ${date}...`);

                        axios(options)
                        .then(response => {
                            const chunks = [];
                            const gzip = zlib.createGunzip();
                            const writer = fs.createWriteStream(filepath);

                            response.data.pipe(gzip).pipe(writer);

                            gzip.on('error', (err) => reject(err));
                            gzip.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
                            gzip.on('end', () => {
                                console.log(`${date} downloaded!`);
                                resolve(Buffer.concat(chunks).toString('utf8'));
                            });
                        })
                        .catch(err => {
                            if (retries <= 0) {
                                fs.rm(filepath, (err) => {
                                    if (err) throw err;
                                });
                                return reject(err);
                            }

                            setTimeout(() => {
                                console.log(`Retrying ${date} (${retries - 4})...`);
                                return fetchArchiveFile(date, --retries);
                            }, backoff);
                        });
                    } else {
                        console.log(`${date} already existing.`);
                        resolve(str);
                    }
                });
            }
        });
    });
};

async function parseAndImportMessages(data) {

	const regex = /From .* at .*  .*\nFrom: (?<mail>.*) at (?<domain>.*) \((?<name>.*)\)\nDate: (?<date>.*)\nSubject: (?<subject>(?:.|\n|\t)+?(?=Message-ID|In-Reply-To|References))(?:In-Reply-To: <(?<inReplyTo>.*)>\n)?(?:References: (?<references>(?:.|\n|\t)+?(?=Message-ID)))?Message-ID: <(?<id>.*)>\n*(?<content>[\w\W]+?)(?=From|$)/gu;
	const matches = data.matchAll(regex);

	const promises = [];

	for (const match of matches) {
		match.groups.subject = match.groups.subject.replace(/\n|\t/gm, "");

		if (match.groups.references) {
			match.groups.references = Array.from(match.groups.references.matchAll(/<(?<id>.*)>/gm), m => m.groups.id);
		} else {
			match.groups.references = [];
		}

		const message = {
			id: match.groups.id,
			from: {
                name: match.groups.name,
				address: `${match.groups.mail}@${match.groups.domain}`
			},
			date: new Date(new Date(match.groups.date).toUTCString()),
			subject: match.groups.subject,
			inReplyTo: match.groups.inReplyTo,
			references: match.groups.references,
			content: match.groups.content
		}

		const promise = Message.findOneAndUpdate(
			{ id: message.id },
			{ $setOnInsert: message },
			{ upsert: true }
		);

		promises.push(promise);
	}

	return Promise.all(promises);
}

async function fetchAndImportArchive(date) {
    return new Promise((resolve, reject) => {
        const promise = fetchArchiveFile(date, save=true);

        promise.catch(err => {
            console.log(`Error downloading ${date}: ${err}`);
            reject(err);
        });

        promise.then(result => {
            parseAndImportMessages(result)
                .then(() => resolve())
                .catch(err => reject(err));
        });
    });
}

async function importFullArchive() {
    let promises = [];

    const startDate = moment('2011-06').format('YYYY-MM');
    for (let m = moment(startDate); m.isBefore(moment()); m.add(1, 'month')) {

        const date = m.format('YYYY-MMMM');
        const promise = fetchAndImportArchive(date);

        promises.push(promise);
    }

    return Promise.all(promises);
}

module.exports = {
    fetchAndImportArchive,
    importFullArchive
};
