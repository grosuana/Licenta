const fs = require('fs-extra');
const Fasta = require('biojs-io-fasta');
const errorHandle = require('./errorHandle');
const _ = require('lodash');
const path = require('path');

/**
 * Opens a FASTA formatted file and reads the DNA sequence from it
 * @param {String} strFilePath 
 * @returns {Promise<Array>} the array of dna sequences found
 */
async function readFastaFile(strFilePath) {
	try {
		if (!fs.existsSync(strFilePath)) {
			errorHandle.fnLogMessage(errorHandle.objLevels.ERROR, errorHandle.objTypes.FASTAFILE + errorHandle.objTypes.ERROR, 'File doesn\'t exist.');
			process.exit(1);
		}
		errorHandle.fnLogMessage(errorHandle.objLevels.INFO, errorHandle.objTypes.FASTAFILE, `Opening FASTA file '${strFilePath}'.`);
		const bufferFileContent = await fs.readFile(strFilePath, 'utf8');
		const strFileContent = bufferFileContent.toString('utf8');
		const arrFastaDataObjects = Fasta.parse(strFileContent);
		arrFastaDataObjects.forEach(objFastaData => {
			objFastaData.seq = _.toUpper(objFastaData.seq);
		});
		return arrFastaDataObjects;
	} catch (err) {
		errorHandle.fnLogMessage(errorHandle.objLevels.ERROR, errorHandle.objTypes.FASTAFILE + errorHandle.objTypes.ERROR, err.message);
		process.exit(1);
	}

}

/**
 * Writes the configuration object to a .js file to be imported into /ui/index.html and display the data
 * @param {String} objGenomeData 
 * @returns {Promise}
 */
async function writeConfigFile(objGenomeData) {
	try {
		const jsonGenomeData = JSON.stringify(objGenomeData);
		const strFileData = `const strGenomeData = \`${jsonGenomeData}\``;
		await fs.writeFile(path.join(__dirname, '../ui/config.js'), strFileData, 'utf8');
	} catch (err) {
		errorHandle.fnLogMessage(errorHandle.objLevels.ERROR, errorHandle.objTypes.CONFIG + errorHandle.objTypes.ERROR, err.message);
		process.exit(1);
	}
}


module.exports = {
	readFastaFile,
	writeConfigFile
};