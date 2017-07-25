var Sherlock = require('sherlockjs');


module.exports = {
	getEventData: function (text) {
		var eventData = {};
		eventData = sherlocker(text, eventData);

		//call luis or google

		return eventData;
	}
}

function sherlocker(text, eventData) {
	//shelock
	sherlockedText = Sherlock.parse(text)
	eventData.title = sherlockedText.eventTitle
	eventData.startDate = sherlockedText.startDate
	eventData.endDate = sherlockedText.endDate
	eventData.isAllDay = sherlockedText.isAllDay

	return eventData;
}

