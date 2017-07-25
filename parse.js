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
	const Language = require('@google-cloud/language');
	const projectId = 'pic2cal';
	const language = Language({
 		projectId: projectId,
    	keyFilename: './keys.json'
	});

	
}
