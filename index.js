const fileParser = require('./utils/fileParser');
// const strFilePath = './testData/test.fna';
const strWrongFilePath = './testData/nuexistt';
const errorHandle = require('./utils/errorHandle');

fileParser.readFastaFile(strWrongFilePath);

process.on('beforeExit', async (nCode) => {
	try{
		await errorHandle.writeMessageToLogfile(errorHandle.types.PROCESSEXIT, `Process about to exit with code ${nCode}.`);
		await Promise.all([errorHandle.cleanUp()]);
		process.exit(nCode);
	} catch(err){
		process.exit(nCode); //todo
	} 
});
process.on('exit', (nCode) => {
	errorHandle.printMessage((nCode === 0) ? errorHandle.levels.INFO : errorHandle.levels.ERROR, errorHandle.types.PROCESSEXIT, `The process exited with code ${nCode}.`);
});