
const argv = require('yargs')
	.options({
		'v': {
			alias: 'verbose',
			demandOption: false,
			describe: 'Set verbose level:\n-v displays errors and warnings\n-vv displays all information for debug purposes',
			type: 'count'
		},
		'l': {
			alias: 'log',
			demandOption: false,
			describe: 'Choose a custom log file to write into.',
			type: 'string'
		}
	})
	.argv;


module.exports = argv;