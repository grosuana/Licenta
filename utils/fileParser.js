const fs = require('fs-extra');
const Fasta = require('biojs-io-fasta');
const error = require('./errorHandle');
const _ = require('lodash');


async function readFastaFile(strFilePath){
	try{
		await error.logMessage(error.levels.INFO, error.types.FASTAFILE, `Opening FASTA file '${strFilePath}'.`);
		const bufferFileContent = await fs.readFile(strFilePath, 'utf8');
		const strFileContent = bufferFileContent.toString('utf8');
		const arrFastaDataObjects = Fasta.parse(strFileContent);
		arrFastaDataObjects.forEach(objFastaData => {
			objFastaData.seq = _.toUpper(objFastaData.seq);
		});
	
		return arrFastaDataObjects;
	} catch(e) {
		await error.logMessage(error.levels.ERROR, error.types.FASTAFILE, e.message);
		process.exitCode = -1;
	}
    
}


module.exports = {
	readFastaFile
};