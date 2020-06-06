const os = require('os');
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
			describe: 'Set verbose level:\n-v displays warnings\n-vv displays all information for debug purposes',
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
			describe: 'Number of threads on which to run program.',
			type: 'number'
		},
		'd': {
			alias: 'box',
			demandOption: false,
			describe: 'DnaA box length.',
			type: 'number'
		},
		'm': {
			alias: 'mismatches',
			demandOption: false,
			describe: 'Number of acceptable mismatches.',
			type: 'number'
		},
		'o': {
			alias: 'ori-size',
			demandOption: false,
			describe: 'Considered size of ORI.',
			type: 'number'
		},
		'f': {
			alias: 'force',
			demandOption: false,
			describe: 'Force program to consider ORI starts at given position.',
			type: 'number'
		},
		's': {
			alias: 'seek',
			demandOption: false,
			describe: 'Searches for the local Skew minimum starting with given position (instead of the global one). Considers it ORI start.',
			type: 'number'
		},

	})
	.default('m', 1)
	.default('d', 9)
	.default('n', os.cpus().length, `current number of CPUs (${os.cpus().length})`)
	.default('o', 500)
	.conflicts('f', 's')
	.argv;

module.exports = argv;