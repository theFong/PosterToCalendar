var Sherlock = require('sherlockjs');

module.exports = {

	getEventData: function (text, res) {

	return new Promise(function(resolve,reject){
		var eventData = {
			'title' : "",
			'startDate' : '',
			'endDate' : '',
			'isAllDay' : '',
			'location' : ''
		};

		sherlocker(text, res, eventData).then(getLocation(text, res, eventData).then(function(ics) { resolve(ics)}));
	});
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

// LUIS
var request = require('request');
query = " ";
url = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/4e86cd0f-7ebe-49dd-8151-d43d45dc8a6c?subscription-key=42f18c757e974d84b1701dfa34e2a366&timezoneOffset=0&verbose=true&q=' + query;

request(url, function (error, response, body) {
  
  console.log('error:', error); 
  console.log('statusCode:', response && response.statusCode); 
  console.log('body:', body); 
  // parse out date times here
});

