const divCanvas = document.getElementById('particle-canvas');
const divChart = document.getElementById('chart');
const objGenomeData = JSON.parse(strGenomeData);
console.log(objGenomeData);
// eslint-disable-next-line
const particleCanvas = new ParticleNetwork(divCanvas, {
	particleColor: '#7a73ff',
	background: 'poza8.png',
	interactive: true,
	speed: 'medium',
	density: 'high'
});

const canvasDnaChart = document.getElementById('canvasDnaChart');

// eslint-disable-next-line
const dnaChart = new Chart(canvasDnaChart, {
	type: 'bar',
	data: {
		labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
		datasets: [{
			label: '# of Votes',
			data: [12, 19, 3, 5, 2, 3],
			backgroundColor: [
				'rgba(255, 99, 132, 0.2)',
				'rgba(54, 162, 235, 0.2)',
				'rgba(255, 206, 86, 0.2)',
				'rgba(75, 192, 192, 0.2)',
				'rgba(153, 102, 255, 0.2)',
				'rgba(255, 159, 64, 0.2)'
			],
			borderColor: [
				'rgba(255, 99, 132, 1)',
				'rgba(54, 162, 235, 1)',
				'rgba(255, 206, 86, 1)',
				'rgba(75, 192, 192, 1)',
				'rgba(153, 102, 255, 1)',
				'rgba(255, 159, 64, 1)'
			],
			borderWidth: 1
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

function sampleData(arrDataToSample, nSkip) {
	const resultArray = [];
	for (let i = 0; i < arrDataToSample.length; i += nSkip) {
		resultArray.push(arrDataToSample[i]);
	}
	const arrLabels = _.times(arrDataToSample.length/nSkip, (index) => {
		return index * nSkip;
	});
	return {
		resultArray,
		arrLabels
	};
}

const objSampleData = sampleData(objGenomeData.skew.arrSkew, 1000);
const arrSampledSkewData = objSampleData.resultArray;
const arrLabels = objSampleData.arrLabels;
console.log(arrLabels);

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