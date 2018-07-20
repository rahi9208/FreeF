let AWS = require('aws-sdk');
let axios = require('axios2');

const baseUrl = "https://private-anon-1b3fb5589e-quotationsearchapi.apiary-mock.com/";

exports.handler = function (event, context, callback) {

	//create application
	axios.post(`${baseUrl}applications`, event)
		.then(resp => {
			console.log("Successfully recieved response", resp.data);
			if (resp.data.ApplicationId) {
				console.log("Application created, Creating application decision for %s...",resp.data.ApplicationId);
				return axios.post(`${baseUrl}applications/${resp.data.ApplicationId}/decisions`, {});
			} else {
				throw new Error("Unexpected payload in step 1");
			}
		}).then(decisionResponse => {
			console.log("Decision response recieved", decisionResponse.data);
			callback(null, decisionResponse.data);
		}).catch(err => {
			console.error("Error in creating new pllication", err);
			callback(err, null);
		})
}

async function fetchApplicationDecision(url, maxRetries) {
	let currentRetries = 0;
	while (currentRetries < maxRetries) {
		console.log("Retrying for the", currentRetries, "time");
		let resp = await doDecisionCall(url, 10000);
		if (resp.data.Status === "Approved") {
			return resp.data.Status;
		}
		currentRetries++;
	}
	throw new Error("Failed to retrieve decision after " + maxRetries + " retires");
}

function doDecisionCall(url, delay) {
	new Promise((resolve, reject) => {
		setTimeout(() => {
			axios.get(url).then(resolve).catch(reject);
		}, delay);
	});
}