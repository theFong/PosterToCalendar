var Sherlock = require('sherlockjs');

module.exports = {

	getEventData: function (text, res) {
		var eventData = {
			'title' : "",
			'startDate' : '',
			'endDate' : '',
			'isAllDay' : '',
			'location' : ''
		};

		sherlocker(text, res, eventData).then(getLocation(text, res, eventData).then(function(ics) { res.send(JSON.stringify(ics))}));
		return eventData;
	}
}

var sherlocker =  function(text, res,  eventData) {
	return new Promise(function(resolve,reject){
		//sherlock
		sherlockedText = Sherlock.parse(text)
		eventData.title = sherlockedText.eventTitle
		eventData.startDate = sherlockedText.startDate
		eventData.endDate = sherlockedText.endDate
		eventData.isAllDay = sherlockedText.isAllDay

		resolve();
	});
}

var getLocation = function(text, res, ics) {
	return new Promise(function(resolve,reject){

		const Language = require('@google-cloud/language');
		const projectId = 'pic2cal';
		const language = Language({
	 		projectId: projectId,
	    	keyFilename: './keys.json'
		});

		const document = language.document({ content: text });

		document.detectEntities().then((results) => {
		    const entities = results[1].entities;
		    entities.forEach((entity) => {
		     		console.log(entity.name);

		      if (entity.type == "LOCATION") {
		      	 ics.location = entity.name;
			     console.log(ics);
		      	 resolve(ics);

		      }
		    });

		  })
		  .catch((err) => {

		  	console.log(err)
		  	reject();
		  });
	});

}

