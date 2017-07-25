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

const Language = require('@google-cloud/language');

// Your Google Cloud Platform project ID
const projectId = 'pic2cal';

// Instantiates a client
const language = Language({
  projectId: projectId
});

	//var key = 'AIzaSyD0qmIEyByT-RzF-mu4arUZOutGaozpjEk';

	//var url = 'https://language.googleapis.com/v1/documents:analyzeEntities?key=' + key;
	
// The text to analyze
const text2 = 'Hello, world!';

// Detects the sentiment of the text
language.detectSentiment(text2)
  .then((results) => {
    const sentiment = results[0];

    console.log(`Text: ${text}`);
    console.log(`Sentiment score: ${sentiment.score}`);
    console.log(`Sentiment magnitude: ${sentiment.magnitude}`);
  })
  .catch((err) => {
    console.error('ERROR:', err);
  });
}
