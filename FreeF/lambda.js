let AWS = require('aws-sdk');
let axios = require('axios2');

const baseUrl = "https://private-anon-1b3fb5589e-quotationsearchapi.apiary-mock.com/";
const tempProdUrl = "https://quotationsearch.com/";

exports.handler = function (event, context, callback) {

	//main flow
	axios.post(`${baseUrl}applications`, event)
		.then(applicationCreateResponse => {
			console.log("Successfully received application create response", applicationCreateResponse.data);
			return axios.post(applicationCreateResponse.data.Links[0].Href.replace(tempProdUrl, baseUrl), {});
		}).then(decisionResponse => {
			console.log("Successfully received decition create response");
			return fetchApplicationDecision(decisionResponse.data.Links[0].Href.replace(tempProdUrl, baseUrl), 10);
		}).then(applicationDecision => {
			callback(null, applicationDecision);
		}).catch(err => {
			console.error("Error in flow", err);
			callback(err, null);
		});
}

async function fetchApplicationDecision(url, maxRetries) {
	console.log("Feteching applicationd decision from", url, "with", maxRetries, "max retries");
	let currentRetries = 0;
	while (currentRetries++ < maxRetries) {
		let resp = await doDecisionCall(url, 10000);
		if (resp.data.Status === "Approved") {
			return resp.data;
		}
		console.log("Retrying for the", currentRetries, "time");
	}
	throw new Error("Failed to retrieve decision after " + maxRetries + " retires");
}

function doDecisionCall(url, delay) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			axios.get(url).then(resolve).catch(reject);
		}, delay);
	});
}