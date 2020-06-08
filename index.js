#!/usr/bin/env node
const opn = require('open');
const path = require('path');
const argv = require('./utils/argumentParser');
const fileParser = require('./utils/fileParser');
const errorHandle = require('./utils/errorHandle');
const genomeUtils = require('./utils/genomeUtils');
const fnFrequentWordsWithMismathces = require('./utils/workerThreads');

const nWantedLength = argv.d;
const nMaxMismatches = argv.m;
const nWindowLength = argv.o;
const strFilePath = argv.i;

async function fnMain() {
	try {
		const arrFastaDataObjects = await fileParser.readFastaFile(strFilePath);
		if (arrFastaDataObjects.length > 1) {
			errorHandle.fnLogMessage(errorHandle.objLevels.WARNING, errorHandle.objTypes.WARNING, `FASTA file contains ${arrFastaDataObjects.length} DNA sequences. Considering first one.`);
		}
		if (arrFastaDataObjects.length === 0) {
			errorHandle.fnLogMessage(errorHandle.objLevels.WARNING, errorHandle.objTypes.FASTAFILE + errorHandle.objTypes.ERROR, 'Invalid FASTA file.');
			process.exit(3);
		}
		const strGenome = arrFastaDataObjects[0].seq;

		let objSkewGraphData;
		if (argv.f !== undefined) {
			objSkewGraphData = genomeUtils.fnSkewDiagramForceMinimum(strGenome, argv.f);
			errorHandle.fnLogMessage(errorHandle.objLevels.INFO, errorHandle.objTypes.MAIN, `Computed Skew graph. Forced ORI start is ${objSkewGraphData.nMinIndex} with Skew value of ${objSkewGraphData.nMinValue}.`);
		} else if (argv.s !== undefined) {
			objSkewGraphData = genomeUtils.fnSkewDiagramLocalMinimum(strGenome, argv.s);
			errorHandle.fnLogMessage(errorHandle.objLevels.INFO, errorHandle.objTypes.MAIN, `Computed Skew graph. Found local minimum Skew with value ${objSkewGraphData.nMinValue} at position ${objSkewGraphData.nMinIndex}.`);
		} else {
			objSkewGraphData = genomeUtils.fnSkewDiagram(strGenome);
			errorHandle.fnLogMessage(errorHandle.objLevels.INFO, errorHandle.objTypes.MAIN, `Computed Skew graph. Minimum Skew value is ${objSkewGraphData.nMinValue} at position ${objSkewGraphData.nMinIndex}.`);
		}

		const strSequence = (strGenome + strGenome).substring(objSkewGraphData.nMinIndex, objSkewGraphData.nMinIndex + nWindowLength);
		errorHandle.fnLogMessage(errorHandle.objLevels.INFO, errorHandle.objTypes.MAIN, 'Looking for DnaA box candidates.');
		const arrResult = await fnFrequentWordsWithMismathces(strSequence, nWantedLength, nMaxMismatches);

		const arrCandidatesPositions = genomeUtils.fnFindCandidatesPositions(arrResult, strSequence, nMaxMismatches);
		// console.log(arrCandidatesPositions.length);

		const objGenomeData = {
			arrCandidates: arrResult,
			objSkew: objSkewGraphData,
			strGenome: strSequence,
			arrPositions: arrCandidatesPositions,
			nSequenceLength: nWantedLength,
			nSequenceStartPosition: objSkewGraphData.nMinIndex,
		};

		await fileParser.writeConfigFile(objGenomeData);
		errorHandle.fnLogMessage(errorHandle.objLevels.INFO, errorHandle.objTypes.MAIN, `Opening ${path.join(__dirname, './ui/index.html')} in default browser.`);
		opn(path.join(__dirname, './ui/index.html'));

	} catch (err) {
		errorHandle.fnLogMessage(errorHandle.objLevels.ERROR, errorHandle.objTypes.MAIN + errorHandle.objTypes.ERROR, err.message);
		process.exit(3);
	}

}

process.on('beforeExit', async (nCode) => {
	try {
		errorHandle.fnWriteMessageToLogfile(errorHandle.objTypes.PROCESSEXIT, `Process about to exit with code ${nCode}.`);
		errorHandle.fnCleanUp();
		process.exit(nCode);
	} catch (err) {
		errorHandle.fnLogMessage(errorHandle.objLevels.ERROR, errorHandle.objTypes.PROCESSEXIT, err.message);
		process.exit(3);
	}
});
process.on('exit', (nCode) => {
	errorHandle.fnPrintMessage((nCode === 0) ? errorHandle.objLevels.SUCCESS : errorHandle.objLevels.ERROR, errorHandle.objTypes.PROCESSEXIT, `The process exited with code ${nCode}.`);
});

fnMain();