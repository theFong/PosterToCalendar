var cool = require('cool-ascii-faces');
var express = require('express');
var app = express();
var removeChars = ['"','='];
var textInImage = "";
var eventDate = {
  year: 2008,
  month: 1,
  day: 1,
};
var dateArray = {};
var dateStr = "";
var eventTitle = "";


app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index')
});

app.get('/cool', function(request, response) {
  response.send(cool());
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/times', function(request, response) {
    var result = ''
    var times = process.env.TIMES || 5
    for (i=0; i < times; i++)
      result += i + ' ';
  response.send(result);
});

var pg = require('pg');

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }
    });
  });
})

function contentRequest(res)
{
	// create the JSON object with URL of image
	jsonObject = JSON.stringify({
		"url" : "http://www.atlanticposters.com/images/foofighters_SP0650.jpg",});

	// HTTP protocol
	var https = require('https');

	// prepare the header for content request to OCR
	var postheaders = {
    	'Content-Type' : 'application/json',
    	'Ocp-Apim-Subscription-Key' : '87a9835e760c4580b64cb7170b22430f'
	};

	// the post options for content request to OCR
	var optionspost = {
	    host : 'api.projectoxford.ai',
	    path : '/vision/v1.0/ocr?language=en&detectOrientation=true',
	    method : 'POST',
	    headers : postheaders,
	};

	// do the POST call
	var reqPost = https.request(optionspost, function(res1) {

	 
	    res1.on('data', function(OCRResponse) {
	        imageToText(OCRResponse, res);
	    });
	});

	// write the json data
	reqPost.write(jsonObject);
	reqPost.end();
	reqPost.on('error', function(e) {
	    console.error(e);
	});
}

function imageToText (jsonString, res) {
    var json = JSON.parse(jsonString, 'utf8');
    var region = json["regions"];
    textInImage = "";

    for(var regionKey in region) {
        var regionObjects = region[regionKey];
        for(var lineKey in regionObjects) {
            if (lineKey == "lines") {
                line = regionObjects[lineKey];
                for (var keyInLine in line) {
                    var lineObjects = line[keyInLine];
                    for (var wordKey in lineObjects) {
                        if (wordKey == "words") {
                            var word = lineObjects[wordKey];
                            for (var keyInWord in word) {
                                var wordObjects = word[keyInWord];
                                textInImage += wordObjects["text"] + " ";
                            }
                        }
                    } 
                }
            }
        }
    }

    textInImage = textInImage.replace(/[^\x20-\x7F]/g, "");
    for (var i = 0; i < removeChars.length; i++) {
       textInImage = textInImage.replace(removeChars[i], "");
     }

     // agregar naty stuff

    textInImage = textInImage.replace(/\s\s+/g, ' ');
    textInImage = toTitleCase(textInImage);

    setMonth(textInImage);

    console.log(eventDate);
    console.log(textInImage);

    var objToJson = { };

    objToJson.day = eventDate.day;
    objToJson.month = eventDate.month;
    objToJson.year = eventDate.year;

    objToJson.response = textInImage;

    res.send(JSON.stringify(objToJson));

     // response for API
     //res.send(textInImage);
     waiting = false;
}

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt)
      {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
}


function setMonth (str) {
  var re = /Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?/g;
  var m;
  var firstIndex, lastIndex;
   
  while ((m = re.exec(str)) !== null) {
    firstIndex = m.index;
    lastIndex = re.lastIndex
      if (m.index === re.lastIndex) {
          re.lastIndex++;
      }
      dateStr += m[0];
      if (isNaN(m[0])) {
        eventDate.month = getMonth (m[0]);
    }
    else {
      eventDate.month = m[0];
    }
    //removeFromText(m[0], "");
    //textInImage = textInImage.replace (m[0], "");
  }
  findDayAndYear(textInImage.substring(lastIndex));
  removeFromText(dateStr, "");
  console.log("EventDate.Month: " + eventDate.month);
  textInImage = textInImage.replace(/\s\s+/g, ' ');
  eventTitle = textInImage;
}

function removeFromText (oldTxt, newTxt) {
  textInImage = textInImage.replace (oldTxt, newTxt);
}

function getMonth (month) {
  var prefixMonth = month.substring(0,3);
  return new Date(prefixMonth + '-1-01').getMonth()+1;
}

function findDayAndYear (str) {
  if (str.substring(0,1)) {
    str = str.substring(1);
  }
  var restOfString = str.split(" ");
  if (isNaN(restOfString[0])) {
    return false;
  }
  if (!isNaN(restOfString[0])) {
    if (restOfString[0].length < 3 && restOfString[0].length > 0) {
      eventDate.day = restOfString[0];
    }
    else if (restOfString[0].length != 0) {
      eventDate.year = restOfString[0];
    }
    dateStr += " " + restOfString[0];
  }
  if (!isNaN(restOfString[1])) {
    if (!restOfString[1].length > 4) {
      eventDate.year = restOfString[1];
    }
    dateStr += " " + restOfString[1];
  }
  console.log("potential day: " + eventDate.day);
  console.log("potential year: " + eventDate.year);
  //GET YEAR
  //new Date().getFullYear();
}



app.get('/Pic2Cal', function (req, res) {
	contentRequest(res);
})

app.get('/Pic2Calendar', function (req, res) {
	res.send("HI");
})



app.get('/Pic2CalendarSample', function (req, res) {

  var startDate = new Date().toISOString();
  var event = new Calendar('Sample Event Name', startDate, startDate, 'Redmond', 'This is the sample description. The event is going to be epic!')
  a = JSON.stringify(event);
  res.send(a);
})

var Calendar = function (name, startDate , endDate, location , description ) {
    this.Name = name;
    this.StartDate = startDate;
    this.EndDate = endDate;
    this.Location = location;
    this.Description = description; 
};

