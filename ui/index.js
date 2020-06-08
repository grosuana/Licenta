const divCanvas = document.getElementById('particle-canvas');
const objGenomeData = JSON.parse(strGenomeData); //eslint-disable-line

// eslint-disable-next-line
const particleCanvas = new ParticleNetwork(divCanvas, {
	particleColor: '#7a73ff',
	background: 'bg.png',
	interactive: true,
	speed: 'medium',
	density: 'high'
});

const canvasDnaChart = document.getElementById('canvasDnaChart');
const arrObjectsWithTrueIndex = [];

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
		if (_.indexOf(objGenomeData.arrPositions, i) !== -1) { //eslint-disable-line
			nHighlight = objGenomeData.nSequenceLength - 1;
		}
		nScaledHeight = nRowNumber - Math.floor(i / nElementsPerRow) + ((nHighlight >= 0) && nHighlightOffset);
		nScaledVal = i % nElementsPerRow + 0.5;
		arrObjectsWithTrueIndex.push({
			x: nScaledVal,
			y: nScaledHeight,
			i: i + objGenomeData.nSequenceStartPosition
		});
		switch (strSequence[i]) {
		case 'A':
			arrDataA.push(new Object({
				x: nScaledVal,
				y: nScaledHeight,
				r: nDefaultRadius
			}));
			break;
		case 'C':
			arrDataC.push(new Object({
				x: nScaledVal,
				y: nScaledHeight,
				r: nDefaultRadius
			}));
			break;
		case 'G':
			arrDataG.push(new Object({
				x: nScaledVal,
				y: nScaledHeight,
				r: nDefaultRadius
			}));
			break;
		case 'T':
			arrDataT.push(new Object({
				x: nScaledVal,
				y: nScaledHeight,
				r: nDefaultRadius
			}));
			break;
		default:
			break;
		}
		nHighlight--;
	}

	return {
		arrDataA,
		arrDataC,
		arrDataG,
		arrDataT
	};
}

const {
	arrDataA,
	arrDataC,
	arrDataG,
	arrDataT
} = fnPrepareGenomeDataToDisplay(objGenomeData, 0.1, 4.8, 2, 5);


// eslint-disable-next-line
const dnaChart = new Chart(canvasDnaChart, {
	type: 'bubble',
	data: {
		datasets: [{
			label: ['A'],
			data: arrDataA,
			backgroundColor: 'rgba(254, 95, 85, 0.8)',
			borderColor: 'rgba(254, 95, 85, 1)',
			borderWidth: 1,
			hoverRadius: 10,
		},
		{
			label: ['C'],
			data: arrDataC,
			backgroundColor: 'rgba(243, 167, 18, 0.8)',
			borderColor: 'rgba(243, 167, 18, 1)',
			borderWidth: 1,
			hoverRadius: 10,
		},
		{
			label: ['G'],
			data: arrDataG,
			backgroundColor: 'rgba(103, 97, 168, 0.8)',
			borderColor: 'rgba(103, 97, 168, 1)',
			borderWidth: 1,
			hoverRadius: 10,
		},
		{
			label: ['T'],
			data: arrDataT,
			backgroundColor: 'rgba(0, 155, 90, 0.8)',
			borderColor: 'rgba(0, 155, 90, 1)',
			borderWidth: 1,
			hoverRadius: 10,
		}
		]
	},
	options: {
		scales: {
			yAxes: [{
				display: false,
				ticks: {
					beginAtZero: true
				},
				gridLines: false
			}],
			xAxes: [{
				display: false,
				gridLines: false
			}]
		},
		legend: {
			display: true,
			labels: {
				boxWidth: 70
			}
		},
		tooltips: {
			enabled: true,
			callbacks: {
				label: function (tooltipItem, data) {
					let label = data.datasets[tooltipItem.datasetIndex].label || '';
					let nTrueIndex = -1;
					for (let i = 0; i < arrObjectsWithTrueIndex.length; i++) {
						if (arrObjectsWithTrueIndex[i].x === tooltipItem.xLabel && arrObjectsWithTrueIndex[i].y === tooltipItem.yLabel) {
							nTrueIndex = arrObjectsWithTrueIndex[i].i.toString();
						}
					}
					if (label) {
						label += ': ' + nTrueIndex;
					}
					return label;
				}
			}
		}
	}
});

function sampleData(arrDataToSample, nSkip) {
	const resultArray = [];
	for (let i = 0; i < arrDataToSample.length; i += nSkip) {
		resultArray.push(arrDataToSample[i]);
	}
	const arrLabels = _.times(arrDataToSample.length / nSkip, (index) => {//eslint-disable-line
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

//eslint-disable-next-line
const stepikChart = new Chart(canvasSkewGraph, {//eslint-disable-line
	type: 'line',

	data: {
		labels: arrLabels,
		datasets: [{
			label: 'G-C',
			data: arrSampledSkewData,
			pointRadius: 0.2,
			pointBorderColor: 'rgba(36, 34, 56, 1)'
		}]
	},
	options: {
		scales: {
			yAxes: [{
				ticks: {
					beginAtZero: true,
					fontColor: '#dee8eeed'
				}
			}],
			xAxes: [{
				ticks: {
					beginAtZero: true,
					fontColor: '#dee8eeed'
				}
			}]
		},

	}
});