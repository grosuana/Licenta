const argv = require('yargs')
	.options({
		'i': {
			alias: 'input',
			demandOption: true,
			describe: 'Path to the input FASTA file.',
			type: 'string'
		},
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
		},
		'n': {
			alias: 'threads',
			demandOption: false,
			describe: 'Number of threads on which to run program. Default is number of cpu\'s.',
			type: 'number'
		},

	})
	.argv;


module.exports = argv;