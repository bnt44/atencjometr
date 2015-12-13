'use strict';
const fs = require('fs');
const Wykop = require('wykop-es6');
const _Date = require('datejs');
const readline = require('readline');
const colors = require('colors');
const path = require('path');

const interval = 100; // interval between single api requests
const setup = {
	apikey: '',
	secretkey: '',
	nick: '',
	date: '',
	minimum: '1',
};
const results = {
	entries: 0,
	pages:   0,
	users:   {},
	paski:   {},
	kolory:  {},
	plusy:   0,
	lastEntryDate: null
};

let cache = JSON.parse(fs.readFileSync(path.join(__dirname, '_keys.json')));
if (cache) {
	setup.apikey = cache.apikey;
	setup.secretkey = cache.secretkey;
}

Wykop.prototype.getPage = function(page) {
	return this.request('profile', 'entries', {
		params: [setup.nick],
		api: {page}
	});
};

Object.prototype.print = function() {
	var str = '';
	for (let key in this) {
		str += key + ': ' + this[key] + '\r\n';
	}
	return str;
};

function sortObject(obj) {
    var arr = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
        	if (obj[prop] >= +setup.minimum) {
        		arr.push({
	                'key': prop,
	                'value': obj[prop]
	            });
        	}
        }
    }
    arr.sort(function(a, b) { return b.value - a.value; });
    return arr;
}


let rl = readline.createInterface(process.stdin, process.stdout);
let prompt = generator();

const questions = [
	{
		id: 'apikey',
		message: 'Podaj klucz API: ',
		error: 'nieprawidłowy klucz API'
	},
	{
		id: 'secretkey',
		message: 'Podaj Sekret API: ',
		error: 'Nieprawidłowy klucz "sekret" aplikacji'
	},
	{
		id: 'nick',
		message: 'Podaj nick: ',
		error: 'nieprawidłowy nick'
	},
	{
		id: 'date',
		message: 'Podaj date do kiedy sprawdzic wpisy (DD.MM.RRRR): ',
		error: 'Nieprawidłowa data, przykład: 01.08.2015'
	},
	{
		id: 'minimum',
		message: 'Minimalna liczba plusów od użytkownika: ',
		error: 'Użytkownicy, którzy dali mniej plusów nie będą uwzględnieni w statystykach'
	}
];

const userParams = {
	'0': 'zielonki',
	'1': 'pomarańczki',
	'2': 'bordo',
	'5': 'administracja',
	'1001': 'zbanowani',
	'1002': 'emoquity',
	'2001': 'niebiescy',
	'': 'niezdefiniowany',
	'male': 'niebieskiepaski',
	'female': 'rozowepaski'
};

function promptQuestion(question) {
	rl.question(question.message, function(answer) {
		answer = answer.trim();
		if (!answer) {
			console.log(question.error);
			return promptQuestion(question);
		} else if (question.id === 'date') {
			var date = Date.parseExact(answer, 'dd.MM.yyyy');
			if (date === null) {
				console.log(question.error);
				return promptQuestion(question);
			}
			setup.date = date;
		} else {
			setup[question.id] = answer;
		}
		/// next question 
		if (prompt.next().done) {
			main();
		}
	});
	rl.write(setup[question.id]);
}

function *generator() {
	for (let i = 0; i < questions.length; i++) {
		promptQuestion(questions[i]);
		yield i;
	}
}

function parseSinglePage(entries) {
	if (!entries.length) return true;
	results.pages++; // increase pages number

	entries.forEach((entry) => {
		results.entries++; // increase entries number
		entry.voters.forEach((vote) => {
			let author = vote.author;
			let sex = vote.author_sex;
			let color = vote.author_group;

			results.plusy++; //increase plusy number
			results.users[author] = ++results.users[author] || 1; //increase votes from user
			results.kolory[color] = ++results.kolory[color] || 1; // increase
			results.paski[sex]    = ++results.paski[sex]    || 1; // increase
		});
	});
	let _d = entries[entries.length-1].date;
	let entryDate = Date.parse(_d);
	results.lastEntryDate = _d;
	return entryDate <= setup.date;
}

function main() {
	rl.pause(); // pause readline
	saveNewKeys(); // save new keys
	let currPage = 1;
	let errCount = 0;
	let wykop = new Wykop(setup.apikey, setup.secretkey, {timeout: 10000});

	(function apiRequest() {
		wykop.getPage(currPage).then(res => {
			console.log('pobieram stronę ' + currPage);
			errCount = 0; // clear error count 
			let done = parseSinglePage(res);
			if (!done) {
				currPage++;
				setTimeout(apiRequest, interval);
			} else {
				console.log('zapisuję\n');
				saveResults();
			}
		})
		.catch((err) => {
			if (errCount++ <= 4) {
				console.log('próbuję ponownie...');
				return setTimeout(apiRequest, 1000);
			}
			if (err.error) {
				if (err.error.code === 5) {
					console.log('Limit API wyczerpany\n'.red);
				}
			}
			console.log('Api niedostępne, przerywam działanie\n'.red);

			rl.resume();
			rl.question('Zapisac to co pobrane? y/n (y): ', (answer) => {
				answer = answer.trim();
				if (!answer || answer === 'y' || answer === 'yes') {
					saveResults();
				}
				rl.close();
			});
		});
	})();
}

function saveNewKeys() {
	let keys = {
		apikey: setup.apikey,
		secretkey: setup.secretkey
	};
	fs.writeFile(path.join(__dirname, '_keys.json'), JSON.stringify(keys), (err) => {
		if (err) console.error(err);
	});

}

function parseSortedUsers(sorted) {
	let res = '';
	sorted.forEach((el) => {
		res += el.key + ': ' + el.value + '\r\n';
	});
	return res;
}

function parseMessages(obj) {
	let res = '';
	for (let prop in obj) {
		if (obj.hasOwnProperty(prop)) {
			res += prop + ': ' + obj[prop] + '\r\n';
		}
	}
	res += '\r\n';
	return res;
}

function parseUserParams(obj) {
	let res = '';
	for (let prop in obj) {
		if (obj.hasOwnProperty(prop) && userParams[prop]) {
			res += userParams[prop] + ': ' + obj[prop] + ' - ' + (+obj[prop] / results.plusy * 100).toFixed(2) + '%\r\n';
		}
	}
	res += '\r\n';
	return res;
}

function saveResults() {
	let fileName = '' + setup.nick + '_' + Date.now() + '.txt';
	let parsedUsers = parseSortedUsers(sortObject(results.users));
	let messages = {
		'Nick': setup.nick,
		'Stron': results.pages,
		'Wpisów': results.entries,
		'Plusów razem': results.plusy,
		'Średnio plusów za wpis': (results.plusy / results.entries).toFixed(3),
		'Mirków': Object.keys(results.users).length,
		'Zakres do': results.lastEntryDate
	};
	let parsedMessages = parseMessages(messages);
	let parsedColors = parseUserParams(results.kolory);
	let parsedPaski = parseUserParams(results.paski);

	console.log(parsedMessages);
	console.log(parsedColors);
	console.log(parsedPaski);

	fs.writeFile(path.join(__dirname, '../', fileName), parsedMessages + parsedColors + parsedPaski + parsedUsers, () => {
		console.log('\nPlik "' + fileName.green + '" ze statystykami został zapisany w folderze\n' + path.join(__dirname, '../').green + '\r\n');
	});
}

// init terminal
prompt.next();