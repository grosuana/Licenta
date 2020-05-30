const _ = require('lodash');
const genome = require('./genomeUtils');

const {
	Worker,
	isMainThread,
	parentPort,
	workerData
} = require('worker_threads');

/** Adds up the values from the worker frequency maps into one final array
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

	mapAllResponses.forEach((value, key) => {
		if (value === nMaxFrequency) {
			arrMostFrequentResponses.push(key);
		}
	});

	return arrMostFrequentResponses;
}

if (isMainThread) {
	module.exports = async function fnFrequentWordsWithMismathces(strGenome, nWantedLength, nMaxMismatches) {
		const os = require('os');
		const argv = require('./argumentParser');
		const nThreadCount = argv.n || os.cpus().length;

		try {
			const arrWorkerPromises = [];
			const nGenomeLength = strGenome.length;
			const nMaxIndexToSearch = nGenomeLength - nWantedLength + 1;
			const strReverseComplementGenome = genome.fnReverseComplement(strGenome);
			let nLastIndexGiven = -1;

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
							strWantedLength: nWantedLength
						}
					});

					worker.on('error', fnRejectWorker);
					worker.on('exit', (code) => {
						if (code !== 0)
							fnRejectWorker(new Error(`Worker stopped with exit code ${code}`));
					});
					worker.on('message', (message) => {
						fnResolveWorker(message);
					});
				}));

			}

			let arrWorkerResponses = await Promise.all(arrWorkerPromises);
			const arrFinalResponse = fnConcatWorkerData(arrWorkerResponses);
			return arrFinalResponse;
		} catch (err) {
			//todo handle error;
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
			strWantedLength
	 * }
	 */
	const mapFrequency = new Map();
	for (let i = workerData.nChunkBeginsAt; i <= workerData.nChunkEndsAt; i++) {
		// console.log(i);
		const strPattern = _.slice(workerData.strGenome, i, i + workerData.strWantedLength).join('');
		const arrNeighborhood = genome.fnFindNeighborsWithMismatches(strPattern, workerData.nMaxMismatches);
		arrNeighborhood.forEach((strNeighbor) => {
			if (!mapFrequency.get(strNeighbor)) {
				mapFrequency.set(strNeighbor, 1);
			} else {
				mapFrequency.set(strNeighbor, mapFrequency.get(strNeighbor) + 1);
			}
		});

		const strRevPattern = _.slice(workerData.strReverseComplementGenome, i, i + workerData.strWantedLength).join('');
		const arrRevNeighborhood = genome.fnFindNeighborsWithMismatches(strRevPattern, workerData.nMaxMismatches);
		arrRevNeighborhood.forEach((strNeighbor) => {
			if (!mapFrequency.get(strNeighbor)) {
				mapFrequency.set(strNeighbor, 1);
			} else {
				mapFrequency.set(strNeighbor, mapFrequency.get(strNeighbor) + 1);
			}
		});
	}
	parentPort.postMessage(mapFrequency);
}