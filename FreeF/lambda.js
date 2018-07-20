let AWS = require('aws-sdk');
let axios = require('axios');

exports.handler = function (event, context, callback) {

	//create application
	axios.post("https://private-anon-1b3fb5589e-quotationsearchapi.apiary-mock.com/applications", event)
		.then(resp => {
			console.log("Successfully recieved response", resp);

		}).catch(err => {
			console.error("Error in creating new pllication", err);
			callback(err, null);
		})
}