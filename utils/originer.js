let test = require('./freqWordsTest');
const _ = require('lodash');

const profiler = require('v8-profiler');
const id = Date.now() + '.profile'; // start profiling
profiler.startProfiling(id);

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
	strReverseComplement = _.reverse(strReverseComplement.split('')).join('');
	return strReverseComplement;
}

function immediateNeighbors(strPattern) {
	let arrAllNucleotides = ['A', 'C', 'G', 'T'];
	let arrImmediateNeighborhood = [strPattern];
	for (let i = 0; i < strPattern.length; i++) {
		let strSymbol = strPattern[i];

		let arrNucleotidesToSubstitute = _.filter(arrAllNucleotides, function (o) {
			return o !== strSymbol;
		});

		arrNucleotidesToSubstitute.forEach((strNucleotide) => {

			arrImmediateNeighborhood.push(strPattern.substring(0, i) + strNucleotide + strPattern.substring(i + 1));
		});
	}
	return arrImmediateNeighborhood;
}

function neighbors(strPattern, nMaxMismatches) {
	let arrNeighborhood = [strPattern];
	for (let j = 0; j < nMaxMismatches; j++) {
		arrNeighborhood.forEach((strNeighbour) => {
			arrNeighborhood = arrNeighborhood.concat(immediateNeighbors(strNeighbour));
			arrNeighborhood = _.uniq(arrNeighborhood);
		});
	}
	return arrNeighborhood;
}

function frequentWordsWithMismathces(strGenome, strWantedLength, nMaxMismatches) {
	let arrCandidates = [];
	let mapFrequency = new Map();
	let nLength = strGenome.length;
	const strReverseComplementGenome = reverseComplement(strGenome);

	for (let i = 0; i <= nLength - strWantedLength; i++) {
		console.log(i);
		let strPattern = _.slice(strGenome, i, i + strWantedLength).join('');
		let arrNeighborhood = neighbors(strPattern, nMaxMismatches);
		for (let j = 0; j < arrNeighborhood.length; j++) {
			let strNeighbor = arrNeighborhood[j];
			if (!mapFrequency.get(strNeighbor)) {
				mapFrequency.set(strNeighbor, 1);
			} else {
				mapFrequency.set(strNeighbor, mapFrequency.get(strNeighbor) + 1);
			}
		}
	}

	strGenome = strReverseComplementGenome;
	for (let i = 0; i <= nLength - strWantedLength; i++) {
		console.log(i);
		let strPattern = _.slice(strGenome, i, i + strWantedLength).join('');
		let arrNeighborhood = neighbors(strPattern, nMaxMismatches);
		for (let j = 0; j < arrNeighborhood.length; j++) {
			let strNeighbor = arrNeighborhood[j];
			if (!mapFrequency.get(strNeighbor)) {
				mapFrequency.set(strNeighbor, 1);
			} else {
				mapFrequency.set(strNeighbor, mapFrequency.get(strNeighbor) + 1);
			}
		}
	}

	let m = 0;

	mapFrequency.forEach((value) => {
		//value + map.get(patternReversed)
		if (value > m) {
			m = value;
			//
		}
	});

	mapFrequency.forEach((value, key) => {
		if (value === m) {
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

test.testAllCases(frequentWordsWithMismathces);

module.exports = {

};