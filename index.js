#!/usr/bin/env node
const argv = require('./utils/argumentParser');

const fileParser = require('./utils/fileParser');
const errorHandle = require('./utils/errorHandle');
const genomeUtils = require('./utils/genomeUtils');
const fnFrequentWordsWithMismathces = require('./utils/workerThreads');
const nWantedLength = 9;
const nMaxMismatches = 3;
const nWindowLength = 500;
const strFilePath = argv.i;

async function fnMain() {
	const arrFastaDataObjects = await fileParser.readFastaFile(strFilePath);
	if(arrFastaDataObjects.length !== 1){
		console.log('warning'); //TODO handle error
	}
	const strGenome = arrFastaDataObjects[0].seq;
	const objSkewGraphData = genomeUtils.fnSkewDiagram(strGenome);
	console.log(objSkewGraphData)
	const strSequence = strGenome.substring(objSkewGraphData.nMinIndex, objSkewGraphData.nMinIndex + nWindowLength);
	const arrResult = await fnFrequentWordsWithMismathces(strSequence, nWantedLength, nMaxMismatches);
	console.log(arrResult);
}

process.on('beforeExit', async (nCode) => {
	try {
		await errorHandle.writeMessageToLogfile(errorHandle.types.PROCESSEXIT, `Process about to exit with code ${nCode}.`);
		await Promise.all([errorHandle.cleanUp()]);
		process.exit(nCode);
	} catch (err) {
		process.exit(nCode); //todo handle error
	}
});
process.on('exit', (nCode) => {
	errorHandle.printMessage((nCode === 0) ? errorHandle.levels.INFO : errorHandle.levels.ERROR, errorHandle.types.PROCESSEXIT, `The process exited with code ${nCode}.`);
});

fnMain();