const fs = require('fs');
const fsPromise = fs.promises;
const argv = require('./argumentParser');
const chalk = require('chalk');
const strLogFileName = (argv.l) || 'originer.log';
let objFileHandle = undefined;

const objMessageTypes = {
	FASTFILEOPEN: '[FASTA FILE OPEN]',
	LOGFILEOPEN: '[LOG FILE OPEN]',
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
	printMessage(levels.WARNING, objMessageTypes.WARNING, "Max supported verbose level is two. Set verbose level to max.")
}
const nVerbose = (argv.v <= 2) ? argv.v : 2;

async function cleanUp() {
	try {
		if (objFileHandle !== undefined) {
			return objFileHandle.close(); //promise
		}
	} catch (err) {
		console.error(err);
	}
}

async function openLogFile(strLogFileName) {
	let objTmpFilehandle = null;
	try {
		objTmpFilehandle = await fsPromise.open(strLogFileName, 'a');
	} catch (err) {
		printMessage(levels.ERROR, objMessageTypes.LOGFILEOPEN, err);
	} finally {
		objFileHandle = objTmpFilehandle;
	}
}

async function writeMessageToLogfile(strType, strMessage) {
	if (objFileHandle === undefined) {
		await openLogFile(strLogFileName);
	}
	try {
		await objFileHandle.write(`${new Date().toISOString()} ${strType}: ${strMessage}\n`);
	} catch (err) {
		console.error(err);
	}

}

async function printMessage(nLevel, strType, strMessage) {
	if (nLevel === levels.INFO && nVerbose >= 2) {
		console.log(`${chalk.inverse(strType.toString())}: ${strMessage.toString()}`);
	} else if (nLevel === levels.SUCCESS && nVerbose >= 2){
		console.log(`${chalk.bgGreen(strType.toString())}: ${chalk.green(strMessage.toString())}`);
	} else if (nLevel === levels.WARNING && nVerbose >= 1) {
		console.log(`${chalk.bgYellow(strType.toString())}: ${chalk.yellow(strMessage.toString())}`);
	} else if (nLevel === levels.ERROR && nVerbose >= 1) {
		console.log(`${chalk.bgRed(strType.toString())}: ${chalk.red(strMessage.toString())}`);
	}
}

async function logMessage(nLevel, strType, strMessage) {
	let arrPromises = [];
	if (nVerbose) {
		arrPromises.push(printMessage(nLevel, strType, strMessage));
	}
	arrPromises.push(writeMessageToLogfile(strType, strMessage));
	return Promise.all(arrPromises);
}

module.exports = {
	logMessage,
	types: objMessageTypes,
	cleanUp,
	printMessage,
	writeMessageToLogfile,
	levels
};