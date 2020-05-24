const os = require('os');
const _ = require('lodash');
const genome = require('./genomeUtils');

// const nThreadCount = os.cpus().length;
const nThreadCount = 2;
const {
	Worker,
	isMainThread,
	parentPort,
	workerData
} = require('worker_threads');

if (isMainThread) {
	module.exports = async function fnFrequentWordsWithMismathces(strGenome, nWantedLength, nMaxMismatches) {
		return new Promise(async (fnResolveMain, fnRejectMain) => {
			const arrWorkerPromises = [];
			const nGenomeLength = strGenome.length;
			const nMaxIndexToSearch = nGenomeLength - nWantedLength + 1;
			const strReverseComplementGenome = genome.fnReverseComplement(strGenome);
			let nLastIndexGiven = -1;
			// console.log("Total indexes: " + nMaxIndexToSearch)
			for (let nWorkerNumber = 0; nWorkerNumber < nThreadCount; nWorkerNumber++) {
				//split data equally bewteen workers
				const nChunkSize = Math.floor(nMaxIndexToSearch / nThreadCount) + (nWorkerNumber < (nMaxIndexToSearch % nThreadCount) ? 1 : 0);
				const nChunkBeginsAt = nLastIndexGiven + 1;
				const nChunkEndsAt = nLastIndexGiven + nChunkSize;
				nLastIndexGiven = nChunkEndsAt;
				// console.log("Chunk " +  nWorkerNumber + ": " + nChunkSize)
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
						fnResolveWorker(message)
					});
				}))

			}
			try {
				let arrWorkerResponses = await Promise.all(arrWorkerPromises);
				// unite data from workers
				const finalMap = new Map(...arrWorkerResponses);
				fnResolveMain(finalMap);
			} catch (err) {
				fnRejectMain(err);
			}

		});
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
	for (let i = workerData.nChunkBeginsAt; i < workerData.nChunkEndsAt; i++) {
		// console.log(i);
		const strPattern = _.slice(workerData.strGenome, i, i + workerData.strWantedLength).join('');
		const arrNeighborhood = genome.fnFindNeighborsWithMismatches(strPattern, workerData.nMaxMismatches);
		arrNeighborhood.forEach((strNeighbor) => {
			if (!mapFrequency.get(strNeighbor)) {
				mapFrequency.set(strNeighbor, 1);
			} else {
				mapFrequency.set(strNeighbor, mapFrequency.get(strNeighbor) + 1);
			}
		})

		const strRevPattern = _.slice(workerData.strReverseComplementGenome, i, i + workerData.strWantedLength).join('');
		const arrRevNeighborhood = genome.fnFindNeighborsWithMismatches(strRevPattern, workerData.nMaxMismatches);
		arrRevNeighborhood.forEach((strNeighbor) => {
			if (!mapFrequency.get(strNeighbor)) {
				mapFrequency.set(strNeighbor, 1);
			} else {
				mapFrequency.set(strNeighbor, mapFrequency.get(strNeighbor) + 1);
			}
		})
	}
	parentPort.postMessage(mapFrequency);
}