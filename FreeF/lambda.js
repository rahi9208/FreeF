let AWS = require('aws-sdk');
let axios = require('axios2');

const baseUrl = "https://private-anon-1b3fb5589e-quotationsearchapi.apiary-mock.com/";

exports.handler = function (event, context, callback) {

	//main flow
	axios.post(`${baseUrl}applications`, event)
		.then(resp => {
			console.log("Successfully recieved response", resp.data);
			if (resp.data.ApplicationId) {
				console.log("Application created, Creating application decision for %s...", resp.data.ApplicationId);
				return axios.post(`${baseUrl}applications/${resp.data.ApplicationId}/decisions`, {});
			} else {
				console.error("Unexpected payload when creating application", resp.data);
				throw new Error("Unexpected payload received when creating application");
			}
		}).then(decisionResponse => {
			return fetchApplicationDecision(decisionResponse.data.Links[0].Href.replace("https://quotationsearch.com/", baseUrl), 10);
		}).then(applicationDecision => {
			callback(null, applicationDecision);
		}).catch(err => {
			console.error("Error in flow", err);
			callback(err, null);
		});
}

async function fetchApplicationDecision(url, maxRetries) {
	console.log("Feteching applicationd decision from", url);
	let currentRetries = 0;
	while (currentRetries < maxRetries) {
		console.log("Retrying for the", currentRetries, "time");
		let resp = await doDecisionCall(url, 10000);
		if (resp.data.Status === "Approved") {
			return resp.data;
		}
		currentRetries++;
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