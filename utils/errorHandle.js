const fs = require('fs');
const fsPromise = fs.promises;
const chalk = require('chalk');
const argv = require('./argumentParser');
const strLogFileName = (argv.l) || 'originer.log';
let objFileHandle = undefined;
const objMessageTypes = {
	FASTAFILE: '[FASTA FILE]',
	LOGFILE: '[LOG FILE]',
	PROCESSEXIT: '[EXIT]',
	WARNING: '[WARNING]',
};
const levels = {
	SUCCESS: 0,
	INFO: 1,
	WARNING: 2,
	ERROR: 3
};
if (argv.v > 2) {
	printMessage(levels.WARNING, objMessageTypes.WARNING, 'Max supported verbose level is two. Set verbose level to max.');
}
const nVerbose = (argv.v <= 2) ? argv.v : 2;

/**
 * MUST AWAIT & CATCH
 * @returns {Promise}
 */
async function cleanUp() {
	try {
		if (objFileHandle !== undefined) {
			return objFileHandle.close(); //promise
		}
	} catch (err) { //should never happen, but trust nobody
		console.error(err);
	}
}

async function openLogFile(strLogFileName) {
	try {
		objFileHandle = await fsPromise.open(strLogFileName, 'a');
	} catch (err) {
		printMessage(levels.ERROR, objMessageTypes.LOGFILE, err);
	}
}

/**
 * MUST AWAIT to avoid multiple writes simultaneously  
 */
async function writeMessageToLogfile(strType, strMessage) {	
	try {
		if (objFileHandle === undefined) {
			await openLogFile(strLogFileName);
		}
		if (objFileHandle !== undefined) {
			await objFileHandle.write(`${new Date().toISOString()} ${strType}: ${strMessage}\n`);
		} else {
			printMessage(levels.ERROR, objMessageTypes.LOGFILE, 'Could not open log file.');
		}
	} catch (err) {
		printMessage(levels.ERROR, objMessageTypes.LOGFILE, err.message);
	}
}

function printMessage(nLevel, strType, strMessage) {
	try {
		if (nLevel === levels.INFO && nVerbose >= 2) {
			console.log(`${chalk.inverse(strType.toString())}: ${strMessage.toString()}`);
		} else if (nLevel === levels.SUCCESS && nVerbose >= 2) {
			console.log(`${chalk.bgGreen(strType.toString())}: ${chalk.green(strMessage.toString())}`);
		} else if (nLevel === levels.WARNING && nVerbose >= 1) {
			console.log(`${chalk.bgYellow(strType.toString())}: ${chalk.yellow(strMessage.toString())}`);
		} else if (nLevel === levels.ERROR && nVerbose >= 1) {
			console.log(`${chalk.bgRed(strType.toString())}: ${chalk.red(strMessage.toString())}`);
		}
	} catch (err) { //should never happen but trust nobody
		console.error(`[ERROR PRINTING MESSAGE]: ${err.message}.`);
	}
}

async function logMessage(nLevel, strType, strMessage) {
	try {
		let arrPromises = [];
		if (nVerbose) {
			arrPromises.push(printMessage(nLevel, strType, strMessage));
		}
		arrPromises.push(writeMessageToLogfile(strType, strMessage));
		await Promise.all(arrPromises);
	} catch (err) {
		printMessage(levels.ERROR, objMessageTypes.LOGFILE, err.message);
	}
}

module.exports = {
	logMessage,
	types: objMessageTypes,
	cleanUp,
	printMessage,
	writeMessageToLogfile,
	levels
};