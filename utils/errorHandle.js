const fs = require('fs');
const chalk = require('chalk');
const argv = require('./argumentParser');
const strLogFileName = (argv.l) || 'originer.log';
let objFileHandle = undefined;
const objMessageTypes = {
	FASTAFILE: '[FASTA FILE]',
	LOGFILE: '[LOG FILE]',
	PROCESSEXIT: '[EXIT]',
	WARNING: '[WARNING]',
	GENOME: '[GENOME]',
	WORKERS: '[WORKERS]',
	CONFIG: '[CONFIG FILE]',
	ERROR: ' ERROR',
	MAIN: '[MAIN]'
};
const objLevels = {
	SUCCESS: 0,
	INFO: 1,
	WARNING: 2,
	ERROR: 3
};
const nVerbose = (argv.v <= 2) ? argv.v : 2;
if (argv.v > 2) {
	fnPrintMessage(objLevels.WARNING, objMessageTypes.WARNING, 'Max supported verbose level is 2. Verbose level was set to max.');
}

/**
 * Closes open handles
 * @returns {Promise}
 */
function fnCleanUp() {
	try {
		if (objFileHandle !== undefined) {
			fs.closeSync(objFileHandle);
			objFileHandle = undefined;
		}
	} catch (err) { //should never happen, but trust nobody
		fnLogMessage(objLevels.WARNING, objMessageTypes.WARNING, err.message);
	}
}

/**
 * Obtains the log file's handle
 * @param {String} strLogFileName 
 */
function openLogFile(strLogFileName) {
	try {
		objFileHandle = fs.openSync(strLogFileName, 'a');
	} catch (err) {
		fnPrintMessage(objLevels.WARNING, objMessageTypes.LOGFILE, err);
		fnCleanUp();
	}
}

/**
 * Writes a given message to the log file
 * @param {String} strType one of objMessageTypes
 * @param {String} strMessage description of what happened
 */
function fnWriteMessageToLogfile(strType, strMessage) {
	try {
		if (objFileHandle === undefined) {
			openLogFile(strLogFileName);
		}
		if (objFileHandle !== undefined) {
			fs.writeSync(objFileHandle, `${new Date().toISOString()} ${strType}: ${strMessage}\n`);
		} else {
			fnPrintMessage(objLevels.WARNING, objMessageTypes.LOGFILE, 'Could not open log file.');
		}
	} catch (err) {
		fnPrintMessage(objLevels.WARNING, objMessageTypes.LOGFILE, err.message);
		fnCleanUp();
	}
}

/**
 * Prints information to screen, depending on the verbosity level
 * @param {Number} nLevel gravity of the message
 * @param {String} strType type (one of objMessageTypes)
 * @param {String} strMessage text to describe what happened
 */
function fnPrintMessage(nLevel, strType, strMessage) {
	try {
		if (nLevel === objLevels.INFO && nVerbose >= 2) {
			console.log(`${chalk.inverse(chalk.bold(strType))}: ${strMessage}`);
		} else if (nLevel === objLevels.SUCCESS /*&& nVerbose >= 2*/ ) {
			console.log(`${chalk.bgGreen(chalk.bold(strType))}: ${chalk.green(strMessage)}`);
		} else if (nLevel === objLevels.WARNING && nVerbose >= 1) {
			console.log(`${chalk.bgYellow(chalk.bold(strType))}: ${chalk.yellow(strMessage)}`);
		} else if (nLevel === objLevels.ERROR /*&& nVerbose >= 1*/ ) {
			console.log(`${chalk.bgRed(chalk.bold(strType))}: ${chalk.red(strMessage)}`);
		}
	} catch (err) { //should never happen but trust nobody
		console.error(`[ERROR PRINTING MESSAGE]: ${err.message}, wanted to print: \n\t${strMessage}.`);
	}
}

/**
 * Prints information to screen, depending on the verbosity level and writes it in the logfile
 * @param {Number} nLevel gravity of the message
 * @param {String} strType type (one of objMessageTypes)
 * @param {String} strMessage text to describe what happened
 */
function fnLogMessage(nLevel, strType, strMessage) {
	try {
		fnPrintMessage(nLevel, strType, strMessage);
		fnWriteMessageToLogfile(strType, strMessage);
	} catch (err) {
		fnPrintMessage(objLevels.ERROR, objMessageTypes.LOGFILE, err.message);
	}
}

module.exports = {
	fnLogMessage,
	objTypes: objMessageTypes,
	fnCleanUp,
	fnPrintMessage,
	fnWriteMessageToLogfile,
	objLevels,
};