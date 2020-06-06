const divCanvas = document.getElementById('particle-canvas');
const divChart = document.getElementById('chart');
const objGenomeData = JSON.parse(strGenomeData);

// eslint-disable-next-line
const particleCanvas = new ParticleNetwork(divCanvas, {
	particleColor: '#7a73ff',
	background: 'poza8.png',
	interactive: true,
	speed: 'medium',
	density: 'high'
});

const canvasDnaChart = document.getElementById('canvasDnaChart');

function fnPrepareGenomeDataToDisplay(objGenomeData, nHighlightOffset, nDefaultRadius, nHighlightRadius, nRowNumber) {
	const strSequence = objGenomeData.strGenome;
	const arrDataA = [];
	const arrDataC = [];
	const arrDataG = [];
	const arrDataT = [];
	const nElementsPerRow = Math.floor(strSequence.length / nRowNumber);
	let nScaledHeight;
	let nScaledVal;
	let nHighlight;
	for (let i = 0; i < strSequence.length; i++) {
		if (_.indexOf(objGenomeData.arrPositions, i) !== -1) {
			nHighlight = objGenomeData.nSequenceLength - 1;
		}
		nScaledHeight = nRowNumber - Math.floor(i / nElementsPerRow) + ((nHighlight >= 0) && nHighlightOffset);
		nScaledVal = i % nElementsPerRow;
		switch (strSequence[i]) {
			case 'A':
				arrDataA.push(new Object({
					x: nScaledVal,
					y: nScaledHeight,
					r: nDefaultRadius
				}))
				break;
			case 'C':
				arrDataC.push(new Object({
					x: nScaledVal,
					y: nScaledHeight,
					r: nDefaultRadius
				}))
				break;
			case 'G':
				arrDataG.push(new Object({
					x: nScaledVal,
					y: nScaledHeight,
					r: nDefaultRadius
				}))
				break;
			case 'T':
				arrDataT.push(new Object({
					x: nScaledVal,
					y: nScaledHeight,
					r: nDefaultRadius
				}))
				break;
			default:
				break;
		}
		nHighlight --;
	}

	return {
		arrDataA,
		arrDataC,
		arrDataG,
		arrDataT
	}
}

const {
	arrDataA,
	arrDataC,
	arrDataG,
	arrDataT
} = fnPrepareGenomeDataToDisplay(objGenomeData, 0.2, 5, 2, 5);
// eslint-disable-next-line
const dnaChart = new Chart(canvasDnaChart, {
	type: 'bubble',
	data: {
		datasets: [{
				label: ['A'],
				data: arrDataA,
				backgroundColor: 'rgba(255, 99, 132, 0.2)',
				borderColor: 'rgba(255, 99, 132, 1)',
				// 'rgba(255, 99, 132, 0.2)',
				// 'rgba(54, 162, 235, 0.2)',
				// 'rgba(255, 206, 86, 0.2)',
				// 'rgba(75, 192, 192, 0.2)',
				// 'rgba(153, 102, 255, 0.2)',
				// 'rgba(255, 159, 64, 0.2)'
				// borderColor: [
				// 	'rgba(255, 99, 132, 1)',
				// 	'rgba(54, 162, 235, 1)',
				// 	'rgba(255, 206, 86, 1)',
				// 	'rgba(75, 192, 192, 1)',
				// 	'rgba(153, 102, 255, 1)',
				// 	'rgba(255, 159, 64, 1)'
				// ],
				borderWidth: 1
			},
			{
				label: ['C'],
				data: arrDataC,
				backgroundColor: 'rgba(54, 162, 235, 0.2)',
				borderColor: 'rgba(54, 162, 235, 1)',
				borderWidth: 1
			},
			{
				label: ['G'],
				data: arrDataG,
				backgroundColor: 'rgba(255, 206, 86, 0.2)',
				borderColor: 'rgba(255, 206, 86, 1)',
				borderWidth: 1
			},
			{
				label: ['T'],
				data: arrDataT,
				backgroundColor: 'rgba(75, 192, 192, 0.2)',
				borderColor: 'rgba(75, 192, 192, 1)',
				borderWidth: 1
			}
		]
	},
	options: {
		scales: {
			yAxes: [{
				ticks: {
					beginAtZero: true
				}
			}]
		}
	}
});

function sampleData(arrDataToSample, nSkip) {
	const resultArray = [];
	for (let i = 0; i < arrDataToSample.length; i += nSkip) {
		resultArray.push(arrDataToSample[i]);
	}
	const arrLabels = _.times(arrDataToSample.length / nSkip, (index) => {
		return index * nSkip;
	});
	return {
		resultArray,
		arrLabels
	};
}

const objSampleData = sampleData(objGenomeData.objSkew.arrSkew, 1000);
const arrSampledSkewData = objSampleData.resultArray;
const arrLabels = objSampleData.arrLabels;

const stepikChart = new Chart(canvasSkewGraph, {
	type: 'line',
	data: {
		labels: arrLabels,
		datasets: [{
			label: '# of Votes',
			data: arrSampledSkewData,
			// backgroundColor: [
			// 	'rgba(255, 99, 132, 0.2)',
			// 	'rgba(54, 162, 235, 0.2)',
			// 	'rgba(255, 206, 86, 0.2)',
			// 	'rgba(75, 192, 192, 0.2)',
			// 	'rgba(153, 102, 255, 0.2)',
			// 	'rgba(255, 159, 64, 0.2)'
			// ],
			// borderColor: [
			// 	'rgba(255, 99, 132, 1)',
			// 	'rgba(54, 162, 235, 1)',
			// 	'rgba(255, 206, 86, 1)',
			// 	'rgba(75, 192, 192, 1)',
			// 	'rgba(153, 102, 255, 1)',
			// 	'rgba(255, 159, 64, 1)'
			// ],
			// borderWidth: 1
		}]
	},
	options: {
		scales: {
			yAxes: [{
				ticks: {
					beginAtZero: true
				}
			}]
		}
	}
});