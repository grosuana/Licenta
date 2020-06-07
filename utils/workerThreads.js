const _ = require('lodash');

const {
	Worker,
	isMainThread,
	parentPort,
	workerData
} = require('worker_threads');

/** Adds up the values from the worker frequency maps into one final frequency map and returns an array that contains the most frequent strings from it
 * @param {Array.<Map>} arrWokerMaps 
 * @returns {Array}
 */
function fnConcatWorkerData(arrWokerMaps) {
	const mapAllResponses = new Map();
	const arrMostFrequentResponses = [];

	arrWokerMaps.forEach((mapWorkerData) => {
		mapWorkerData.forEach((nValue, strKey) => {
			if (!mapAllResponses.get(strKey)) {
				mapAllResponses.set(strKey, nValue);
			} else {
				mapAllResponses.set(strKey, mapAllResponses.get(strKey) + nValue);
			}
		});
	});

	let nMaxFrequency = 0;
	mapAllResponses.forEach((nFrequency) => {
		if (nFrequency > nMaxFrequency) {
			nMaxFrequency = nFrequency;
		}
	});
	// console.log("Max frequency: " + nMaxFrequency);
	mapAllResponses.forEach((value, key) => {
		if (value === nMaxFrequency) {
			arrMostFrequentResponses.push(key);
		}
	});

	// const arrUniqueResponses = [];
	// let strReverseComplementSequence;
	// arrMostFrequentResponses.forEach((strSequence) =>{
	// 	strReverseComplementSequence = genome.fnReverseComplement(strSequence);
	// 	if(!arrUniqueResponses.includes(strSequence) && !arrUniqueResponses.includes(strReverseComplementSequence)){
	// 		arrUniqueResponses.push(strSequence);
	// 	}
	// });
	// console.log('Uniques: ' + arrUniqueResponses.toString());

	return arrMostFrequentResponses;
}

if (isMainThread) {
	module.exports = async function fnFrequentWordsWithMismathces(strGenome, nWantedLength, nMaxMismatches) {
		const os = require('os');
		const argv = require('./argumentParser');
		const nThreadCount = argv.n || os.cpus().length;
		const errorHandle = require('./errorHandle');
		const genomeUtils = require('./genomeUtils');

		if (nThreadCount > os.cpus().length) {
			errorHandle.fnLogMessage(errorHandle.objLevels.WARNING, errorHandle.objTypes.WARNING, `Running on more threads (${nThreadCount}) than CPUs (${os.cpus().length}) is not recommended.`);
		}

		try {
			const arrWorkerPromises = [];
			const nGenomeLength = strGenome.length;
			const nMaxIndexToSearch = nGenomeLength - nWantedLength + 1;
			const strReverseComplementGenome = genomeUtils.fnReverseComplement(strGenome);
			let nLastIndexGiven = -1;

			errorHandle.fnLogMessage(errorHandle.objLevels.INFO, errorHandle.objTypes.WORKERS, `Starting ${nThreadCount} workers.`);
			for (let nWorkerNumber = 0; nWorkerNumber < nThreadCount; nWorkerNumber++) {
				//split data equally bewteen workers
				const nChunkSize = Math.floor(nMaxIndexToSearch / nThreadCount) + (nWorkerNumber < (nMaxIndexToSearch % nThreadCount) ? 1 : 0);
				const nChunkBeginsAt = nLastIndexGiven + 1;
				const nChunkEndsAt = nLastIndexGiven + nChunkSize;
				nLastIndexGiven = nChunkEndsAt;

				// console.log(`Size: ${nChunkSize} I deal with ${nChunkBeginsAt} to ${nChunkEndsAt}.`);

				//create workers
				arrWorkerPromises.push(new Promise((fnResolveWorker, fnRejectWorker) => {
					const worker = new Worker(__filename, {
						workerData: {
							strGenome,
							strReverseComplementGenome,
							nMaxMismatches,
							nChunkBeginsAt,
							nChunkEndsAt,
							nWantedLength
						}
					});

					worker.on('error', (err) => {
						errorHandle.fnLogMessage(errorHandle.objLevels.ERROR, errorHandle.objTypes.WORKERS + errorHandle.objTypes.ERROR, err.message);
						fnRejectWorker();
					});
					worker.on('exit', (code) => {
						if (code !== 0)
							errorHandle.fnLogMessage(errorHandle.objLevels.ERROR, errorHandle.objTypes.WORKERS + errorHandle.objTypes.ERROR, `A worker stopped with exit code ${code}`);
						fnRejectWorker(new Error(`A worker stopped with exit code ${code}`));
					});
					worker.on('message', (message) => {
						fnResolveWorker(message);
					});
				}));

			}

			let arrWorkerResponses = await Promise.all(arrWorkerPromises);
			const arrFinalResponse = fnConcatWorkerData(arrWorkerResponses);
			errorHandle.fnLogMessage(errorHandle.objLevels.SUCCESS, errorHandle.objTypes.WORKERS, `Successfully found ${arrFinalResponse.length} DnaA box candidates: ${arrFinalResponse.toString()}.`);
			return arrFinalResponse;

		} catch (err) {
			errorHandle.fnLogMessage(errorHandle.objLevels.ERROR, errorHandle.objTypes.WORKERS + errorHandle.objTypes.ERROR, err || 'The main thread stopped. Either the main or one of the workers failed. Check logfile.');
			process.exit(2);
		}
	};

} else {
	/**
	 * workerData = {
	 * 		strGenome,
	 * 		strReverseComplementGenome,
			nMaxMismatches,
			nChunkBeginsAt,
			nChunkEndsAt,
			nWantedLength
	 * }
	 */

	//sanity-checking workerData
	if (!(workerData.strGenome !== undefined &&
			workerData.strReverseComplementGenome !== undefined &&
			workerData.nMaxMismatches !== undefined &&
			workerData.nChunkBeginsAt !== undefined &&
			workerData.nChunkEndsAt !== undefined &&
			workerData.nWantedLength !== undefined)) {
		throw new Error('Worker did not receive the expected data object');
	}
	//end
	const genomeUtils = require('./genomeUtils');
	const mapFrequency = new Map();
	for (let i = workerData.nChunkBeginsAt; i <= workerData.nChunkEndsAt; i++) {
		const strPattern = _.slice(workerData.strGenome, i, i + workerData.nWantedLength).join('');
		const arrNeighborhood = genomeUtils.fnFindNeighborsWithMismatches(strPattern, workerData.nMaxMismatches);
		arrNeighborhood.forEach((strNeighbor) => {
			// if (workerData.strGenome.includes(strNeighbor)) {
			if (!mapFrequency.get(strNeighbor)) {
				mapFrequency.set(strNeighbor, 1);
			} else {
				mapFrequency.set(strNeighbor, mapFrequency.get(strNeighbor) + 1);
			}
			// }

		});

		const strRevPattern = genomeUtils.fnReverseComplement(strPattern);
		const arrRevNeighborhood = genomeUtils.fnFindNeighborsWithMismatches(strRevPattern, workerData.nMaxMismatches);
		arrRevNeighborhood.forEach((strNeighbor) => {
			// if (workerData.strGenome.includes(strNeighbor)) {
			if (!mapFrequency.get(strNeighbor)) {
				mapFrequency.set(strNeighbor, 1);
			} else {
				mapFrequency.set(strNeighbor, mapFrequency.get(strNeighbor) + 1);

			}
			// }
		});
	}
	parentPort.postMessage(mapFrequency);
}