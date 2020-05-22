const fs = require('fs-extra');
const Fasta = require('biojs-io-fasta');
const error = require('./errorHandle');


async function readFastaFile(strFilePath){
	try{
		await error.logMessage(error.levels.INFO, error.types.FASTFILEOPEN, `Opening FASTA file ${strFilePath}.`);
		const bufferFileContent = await fs.readFile(strFilePath, 'utf8');
		const strFileContent = bufferFileContent.toString('utf8');
		const objFastaData = Fasta.parse(strFileContent);
		return objFastaData;
	} catch(e) {
		await error.logMessage(error.levels.ERROR, error.types.FASTFILEOPEN, e.message);
		process.exitCode = -1;
	}
    
}


module.exports = {
	readFastaFile
};