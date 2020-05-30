const _ = require('lodash');

function fnImmediateNeighbors(strPattern) {
	const arrAllNucleotides = ['A', 'C', 'G', 'T'];
	const arrImmediateNeighborhood = [strPattern];
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

function fnFindNeighborsWithMismatches(strPattern, nMaxMismatches) {
	let arrNeighborhood = [strPattern];
	for (let j = 0; j < nMaxMismatches; j++) {
		arrNeighborhood.forEach((strNeighbour) => {
			arrNeighborhood = arrNeighborhood.concat(fnImmediateNeighbors(strNeighbour));

		});
		arrNeighborhood = _.uniq(arrNeighborhood);
	}
	return arrNeighborhood;
}

function fnReverseComplement(strPattern) {
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

function fnSkewDiagram(strGenome) {
	const arrSkew = [0];
	const nGenomeLength = strGenome.length;
	let nLastValue = 0;
	let nMinValue = nGenomeLength + 1;
	let nMinIndexInGenome = 0;
	for (let i = 0; i < nGenomeLength; i++) {
		switch (strGenome[i]) {
		case 'G':
			nLastValue += 1;
			arrSkew.push(nLastValue);
			if(nLastValue < nMinValue){
				nMinValue = nLastValue;
				nMinIndexInGenome = i;
			}
			break;
		case 'C':
			nLastValue -= 1;
			arrSkew.push(nLastValue);
			break;
		default:
			arrSkew.push(nLastValue);
			break;
		}

	}
	return {arrSkew, nMinIndex: nMinIndexInGenome, nMinValue};
}

module.exports = {
	fnFindNeighborsWithMismatches,
	fnReverseComplement,
	fnSkewDiagram
};