const _ = require('lodash');
/**Finds the neighborhood of a given string => strings that differ whith only one nucleotide (Hamming distance = 1)
 * MUST TRY CATCH
 * @param {String} strPattern string from which to generate the neighborhood
 * @returns {Array} array of all strings at a Hamming distance = 1
 */
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

/** Generates all strings at a given Hamming distance away from the given string
 * MUST TRY CATCH
 * @param {String} strPattern given string from which to generate neighborhood
 * @param {Number} nMaxMismatches the max Hamming distance 
 * @returns {Array} array of all strings in the neighborhood
 */
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

/** Generates the reverse complement DNA strand (the corresponding DNA strand from the double helix)
 * MUST TRY CATCH
 * @param {String} strPattern the DNA strand to inverse & complement
 * @returns {String} the reverse complement DNA strand
 */
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

/** Computes the values of the Skew diagram
 * MUST TRY CATCH
 * @param {String} strGenome the string for which to compute Skew
 * @returns {{arrSkew: Array, nMinIndex: Number, nMinIndexInGenome: Number}} object containing the Skew values, the minimum Skew value and where in the initial string is the minimum value obtained
 */
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
				if (nLastValue < nMinValue) {
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

	return {
		arrSkew,
		nMinIndex: nMinIndexInGenome,
		nMinValue
	};
}

/**
 * Allows user to select a genome index from where to start looking for the local minimum, instead of finding the global one
 * MUST TRY CATCH
 * @param {String} strGenome 
 * @param {Number} nIndexToStart 
 * @param {Number} nTolerance 
 */
function fnSkewDiagramLocalMinimum(strGenome, nIndexToStart, nTolerance = 5000) {

	if (nIndexToStart > strGenome.length) {
		throw new Error('Index to start seeking for local Skew minimum is greater than genome length.');
	}
	const objSkewGraphData = fnSkewDiagram(strGenome);
	let nMinIndexInGenome = 0;
	let nMinValue = strGenome.length + 1;
	let nIndexToStop = nIndexToStart + nTolerance;
	const arrSkew = objSkewGraphData.arrSkew;

	for (let i = nIndexToStart; i < arrSkew.length && i < nIndexToStop; i++) {

		if (arrSkew[i] < nMinValue) {
			nMinValue = arrSkew[i];
			nMinIndexInGenome = i;
			nIndexToStop = i + nTolerance;
		}
	}

	return {
		arrSkew,
		nMinIndex: nMinIndexInGenome,
		nMinValue
	};
}

/**
 * Forces the algorithm to consider a fixed position the Skew minimum
 * MUST TRY CATCH
 * @param {String} strGenome 
 * @param {Number} nForcedPosition 
 */
function fnSkewDiagramForceMinimum(strGenome, nForcedPosition) {

	if (nForcedPosition > strGenome.length) {
		throw new Error('Forced ORI start position is greater than genome length.');
	}
	const objSkewGraphData = fnSkewDiagram(strGenome);
	return {
		arrSkew: objSkewGraphData.arrSkew,
		nMinIndex: nForcedPosition,
		nMinValue: objSkewGraphData.arrSkew[nForcedPosition]
	};

}

function fnFindCandidatesPositions(arrCandidates, strGenome, nMaxMismatches) {
	let arrCandidatesPositions = [];
	arrCandidates.forEach((strCandidate) => {
		const arrPartialNeighborhood = fnFindNeighborsWithMismatches(strCandidate, nMaxMismatches);
		arrPartialNeighborhood.forEach((strNeighbour) => {
			if (strGenome.includes(strNeighbour)) {

				let nNeighbourIndex = strGenome.indexOf(strNeighbour)
				// console.log(strNeighbour)
				if (strGenome.indexOf(strNeighbour) !== strGenome.lastIndexOf(strNeighbour)) { //multiple app.
					while (nNeighbourIndex !== -1) {
						arrCandidatesPositions.push(nNeighbourIndex);
						// console.log("ap multiple: " + strNeighbour + nNeighbourIndex)
						nNeighbourIndex = strGenome.indexOf(strNeighbour, nNeighbourIndex + 1);
						
					}
				} else { //only one app.
					arrCandidatesPositions.push(nNeighbourIndex);
				}
			}
		})
	});
	console.log(arrCandidatesPositions)
	return arrCandidatesPositions;
}

module.exports = {
	fnFindNeighborsWithMismatches,
	fnReverseComplement,
	fnSkewDiagram,
	fnSkewDiagramLocalMinimum,
	fnSkewDiagramForceMinimum,
	fnFindCandidatesPositions
};