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


	const Language = require('@google-cloud/language');
	const projectId = 'pic2cal';
	const language = Language({
 		projectId: projectId,
    	keyFilename: './keys.json'
	});

		const document = language.document({ content: text });


	document.detectEntities()
  .then((results) => {
    const entities = results[1].entities;

    console.log('Entities:');
    entities.forEach((entity) => {
     
      if (entity.type == "LOCATION") {
      	 return entity.name;
      }
    });
  })
  .catch((err) => {
    console.error('ERROR:', err);
  });
}
