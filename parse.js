var Sherlock = require('sherlockjs');

module.exports = {
	getEventData: function (text) {
		var eventData = {};
		eventData = sherlocker(text, eventData);

		eventData.location = getLocation(text);

		return eventData;
	}
}

function sherlocker(text, eventData) {
	//sherlock
	sherlockedText = Sherlock.parse(text)
	eventData.title = sherlockedText.eventTitle
	eventData.startDate = sherlockedText.startDate
	eventData.endDate = sherlockedText.endDate
	eventData.isAllDay = sherlockedText.isAllDay

	return eventData;
}

function getLocation(text){
	//goog stuff

// Google cloud settings
// Run npm install --save @google-cloud/language
var key = 'AIzaSyD0qmIEyByT-RzF-mu4arUZOutGaozpjEk';
var url = 'https://language.googleapis.com/v1/documents:analyzeEntities?key=' + key;


	var optionspost = {
	    host : 'api.projectoxford.ai',
	    path : '/vision/v1.0/ocr?language=en&detectOrientation=true',
	    method : 'POST',
	};

	// do the POST call
	var reqPost = https.request(optionspost, function(res1) {

	    res1.on('data', function(OCRResponse) {
	        imageToText(OCRResponse, res);
	    });
	});
}
