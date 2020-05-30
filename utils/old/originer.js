const objTestHelper = require('../freqWordsTest');
const _ = require('lodash');

let eta = 0;

function reverseComplement(strPattern) {
	let strReverseComplement = '';
	for (let i = 0; i < strPattern.length; i++) {
		switch (strPattern[i]) {
		case 'A':
			strReverseComplement = strReverseComplement.concat('T');
			break;
		case 'T':
			strReverseComplement = strReverseComplement.concat('A');
			break;
		case 'C':
			strReverseComplement = strReverseComplement.concat('G');
			break;
		case 'G':
			strReverseComplement = strReverseComplement.concat('C');
			break;
		default:
			break;
		}
	}
	return _.reverse(strReverseComplement.split('')).join('');
}

function immediateNeighbors(strPattern) {
	const arrAllNucleotides = ['A', 'C', 'G', 'T'];
	const arrImmediateNeighborhood = [strPattern];

	/* //Which one is faster?
	for (let i = 0; i < strPattern.length; i++) {
		const strSymbol = strPattern[i];
		const arrNucleotidesToSubstitute = _.filter(arrAllNucleotides, function (o) {
			return o !== strSymbol;
		});
		arrNucleotidesToSubstitute.forEach((strNucleotide) => {
			arrImmediateNeighborhood.push(strPattern.substring(0, i) + strNucleotide + strPattern.substring(i + 1));
		});
	}
	*/
	_.forEach(strPattern, (strSymbol, i) => {
		const arrNucleotidesToSubstitute = _.filter(arrAllNucleotides, function (o) {
			return o !== strSymbol;
		});
		arrNucleotidesToSubstitute.forEach((strNucleotide) => {
			arrImmediateNeighborhood.push(strPattern.substring(0, i) + strNucleotide + strPattern.substring(i + 1));
		});
	});
	return arrImmediateNeighborhood;
}

function neighbors(strPattern, nMaxMismatches) {
	// const start = process.hrtime();
	let arrNeighborhood = [strPattern];
	for (let j = 0; j < nMaxMismatches; j++) {
		arrNeighborhood.forEach((strNeighbour) => {
			arrNeighborhood = arrNeighborhood.concat(immediateNeighbors(strNeighbour));
		
		});
		// const start = process.hrtime();
		arrNeighborhood = _.uniq(arrNeighborhood);
		// const stop = process.hrtime(start);
		// eta = eta + stop[0] + stop[1] / 1e9;
	}
	// const stop = process.hrtime(start);
	// eta = eta + stop[0] + stop[1] / 1e9;
	return arrNeighborhood;
}

function frequentWordsWithMismathces(strGenome, strWantedLength, nMaxMismatches) {
	const arrCandidates = [];
	const mapFrequency = new Map();
	const nLength = strGenome.length;
	const strReverseComplementGenome = reverseComplement(strGenome);

	for (let i = 0; i <= nLength - strWantedLength; i++) {
		console.log(i);
		const strPattern = _.slice(strGenome, i, i + strWantedLength).join('');
		const arrNeighborhood = neighbors(strPattern, nMaxMismatches);
		/*for (let j = 0; j < arrNeighborhood.length; j++) {
			const strNeighbor = arrNeighborhood[j];
			if (!mapFrequency.get(strNeighbor)) {
				mapFrequency.set(strNeighbor, 1);
			} else {
				mapFrequency.set(strNeighbor, mapFrequency.get(strNeighbor) + 1);
			}
		}*/
		arrNeighborhood.forEach((strNeighbor) => {
			if (!mapFrequency.get(strNeighbor)) {
				mapFrequency.set(strNeighbor, 1);
			} else {
				mapFrequency.set(strNeighbor, mapFrequency.get(strNeighbor) + 1);
			}
		});
	}

	for (let i = 0; i <= nLength - strWantedLength; i++) {
		console.log(i);
		const strPattern = _.slice(strReverseComplementGenome, i, i + strWantedLength).join('');
		const arrNeighborhood = neighbors(strPattern, nMaxMismatches);
		// for (let j = 0; j < arrNeighborhood.length; j++) {
		// 	const strNeighbor = arrNeighborhood[j];
		// 	if (!mapFrequency.get(strNeighbor)) {
		// 		mapFrequency.set(strNeighbor, 1);
		// 	} else {
		// 		mapFrequency.set(strNeighbor, mapFrequency.get(strNeighbor) + 1);
		// 	}
		// }
		arrNeighborhood.forEach((strNeighbor) => {
			if (!mapFrequency.get(strNeighbor)) {
				mapFrequency.set(strNeighbor, 1);
			} else {
				mapFrequency.set(strNeighbor, mapFrequency.get(strNeighbor) + 1);
			}
		});
	}

	let nMaxFrequency = 0;
	mapFrequency.forEach((nFrequency) => {
		if (nFrequency > nMaxFrequency) {
			nMaxFrequency = nFrequency;
		}
	});

	mapFrequency.forEach((value, key) => {
		if (value === nMaxFrequency) {
			arrCandidates.push(key);
		}
	});
	return arrCandidates;
}

// let array = frequentWordsWithMismathces("AGTCAGTC", 4, 2);
// let string = [];
// array.forEach((str) => {
//     string = string + " " + str;
// })
// console.log(string);

// frequentWordsWithMismathces(_.toUpper("aactctatacctcctttttgtcgaatttgtgtgatttatagagaaaatcttattaactgaaactaaaatggtaggtttggtggtaggttttgtgtacattttgtagtatctgatttttaattacataccgtatattgtattaaattgacgaacaattgcatggaattgaatatatgcaaaacaaacctaccaccaaactctgtattgaccattttaggacaacttcagggtggtaggtttctgaagctctcatcaatagactattttagtctttacaaacaatattaccgttcagattcaagattctacaacgctgttttaatgggcgttgcagaaaacttaccacctaaaatccagtatccaagccgatttcagagaaacctaccacttacctaccacttacctaccacccgggtggtaagttgcagacattattaaaaacctcatcagaagcttgttcaaaaatttcaatactcgaaacctaccacctgcgtcccctattatttactactactaataatagcagtataattgatctga"), 9, 3);
// console.log(eta);

// objTestHelper.testAllCases(frequentWordsWithMismathces);

const workerThreads = require('../workerThreads');
workerThreads(1, 2, 'ana');

module.exports = {

};