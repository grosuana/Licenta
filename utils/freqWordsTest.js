const _ = require('lodash');

async function testFunction(fnFunctionToTest, arrInputParams, arrExpectedResponse) { //arrExpectedResponse not in order!
	let arrResponse = await fnFunctionToTest(...arrInputParams);
	return (_.difference(arrResponse, arrExpectedResponse).length === 0);
}

async function testAllCases(fnFunctionToTest) {
	let arrResults = [];
	arrResults.push(await testFunction(fnFunctionToTest, ['ACGTTGCATGTCGCATGATGCATGAGAGCT', 4, 1], ['ACAT', 'ATGT']));
	arrResults.push(await testFunction(fnFunctionToTest, ['AAAAAAAAAA', 2, 1], ['AT', 'TA']));
	arrResults.push(await testFunction(fnFunctionToTest, ['AGTCAGTC', 4, 2], ['AATT', 'GGCC']));
	arrResults.push(await testFunction(fnFunctionToTest, ['AATTAATTGGTAGGTAGGTA', 4, 0], ['AATT']));
	arrResults.push(await testFunction(fnFunctionToTest, ['ATA', 3, 1], ['AAA', 'AAT', 'ACA', 'AGA', 'ATA', 'ATC', 'ATG', 'ATT', 'CAT', 'CTA', 'GAT', 'GTA', 'TAA', 'TAC', 'TAG', 'TAT', 'TCT', 'TGT', 'TTA', 'TTT']));
	arrResults.push(await testFunction(fnFunctionToTest, ['AAT', 3, 0], ['AAT', 'ATT']));
	arrResults.push(await testFunction(fnFunctionToTest, ['TAGCG', 2, 1], ['CA', 'CC', 'GG', 'TG']));
	arrResults.forEach((bResult, nIndex) => {
		if (bResult) {
			console.log(`Passed test ${nIndex + 1}.`);
		} else {
			console.log(`Failed test ${nIndex + 1}.`);
		}
	});
}

module.exports = {
	testAllCases
};