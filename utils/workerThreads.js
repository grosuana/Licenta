const os = require('os');
const nThreadNumber = os.cpus().length;
const {
	Worker,
	isMainThread,
	parentPort,
	workerData
} = require('worker_threads');

if (isMainThread) {
	module.exports = function frequentWordsWithMismathces(strGenome, strWantedLength, nMaxMismatches) {
		return new Promise((resolve, reject) => {
			for(i=0; i<nThreadNumber; i++){
				const worker = new Worker(__filename, {
					workerData: {strGenome, strWantedLength, nMaxMismatches, i}
				});
				worker.on('message', resolve);
				worker.on('error', reject);
				worker.on('exit', (code) => {
					if (code !== 0)
						reject(new Error(`Worker stopped with exit code ${code}`));
				});
			}
		});
	};
} else {
	// const { parse } = require('some-js-parsing-library');
	// const script = workerData;
	// parentPort.postMessage(parse(script));
	console.log('workerData: ' + workerData.i);
	console.log(workerData);
}