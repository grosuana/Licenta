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
	})
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

module.exports = {
    fnFindNeighborsWithMismatches,
    fnReverseComplement
}
