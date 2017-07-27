var cool = require('cool-ascii-faces');
var express = require('express');
var parse = require('./parse');
var url = require('url');
var app = express();

//for post image to nodejs server
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './photos');
    },
    filename: function(req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
    }
});
var upload = multer({ storage: storage }).single('userPhoto');

var removeChars = ['"', '='];
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

app.get('/test', function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

//POST for photos from users
app.post('/api/photo', function(req, res) {
    contentRequest(res, req.file.path);
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

app.get('/times', function(request, response) {
    var result = ''
    var times = process.env.TIMES || 5
    for (i = 0; i < times; i++)
        result += i + ' ';
    response.send(result);
});

var pg = require('pg');

app.get('/db', function(request, response) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query('SELECT * FROM test_table', function(err, result) {
            done();
            if (err) {
                console.error(err);
                response.send("Error " + err);
            } else { response.render('pages/db', { results: result.rows }); }
        });
    });
})

function contentRequest(res, imgPath) {
    // create the JSON object with URL of image
    jsonObject = JSON.stringify({
        "url": imgPath
    });

    // HTTP protocol
    var https = require('https');

    // prepare the header for content request to OCR
    var postheaders = {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': '87a9835e760c4580b64cb7170b22430f'
    };

    // the post options for content request to OCR
    var optionspost = {
        host: 'api.projectoxford.ai',
        path: '/vision/v1.0/ocr?language=en&detectOrientation=true',
        method: 'POST',
        headers: postheaders,
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

function getTitle(json) {
    //str.split(' 
    var region = json["regions"];

    //console.log(json);
    var title = { 'size': 0, 'words': "" };
    for (var regionKey in region) {
        var regionObjects = region[regionKey];
        for (var lineKey in regionObjects) {
            if (lineKey == "lines") {
                line = regionObjects[lineKey];
                for (var keyInLine in line) {
                    var lineObjects = line[keyInLine];
                    for (var wordKey in lineObjects) {

                        if (wordKey == "boundingBox") {
                            var box = lineObjects[wordKey];
                            console.log(box);
                            box = box.split(",");
                            var height = parseInt(box[box.length - 1]);

                            if (Math.abs(title.size - height) < 5) {


                                var words = lineObjects["words"];
                                for (var keyInWord in words) {
                                    var wordObjects = words[keyInWord];
                                    title.words += wordObjects["text"] + " ";
                                }
                            } else if (title.size < height) {
                                title.size = height;
                                title.words = "";
                                var words = lineObjects["words"];
                                for (var keyInWord in words) {
                                    var wordObjects = words[keyInWord];
                                    title.words += wordObjects["text"] + " ";
                                }

                            }

                        }
                    }
                }
            }
        }
    }

    console.log(title);
    return title.words;
}


function imageToText(jsonString, res) {
    var json = JSON.parse(jsonString, 'utf8');
    var region = json["regions"];

    textInImage = "";

    if (json.orientation === 'NotDetected') {
        failed = {};
        failed.error = "NotDetected";
        res.send(JSON.stringify(failed));
        return;
    }


    for (var regionKey in region) {
        var regionObjects = region[regionKey];
        for (var lineKey in regionObjects) {
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
    // console.log(eventDate);
    console.log("textInImage: ", textInImage);

    title = getTitle(json);

    parse.getEventData(textInImage, res, title).then(function(ics) {

        console.log("Sending back to frontend");
        console.log(ics);
        res.send(JSON.stringify(ics));
        waiting = false;
    });


}


function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}


app.get('/Pic2Cal', function(req, res) {
    contentRequest(res);
})

app.get('/eventParse', function(req, res) {
    // res.send(JSON.stringify(parse.getEventData(req.query.text, res)));
    parse.getEventData("Foo Fighters Supercrass - The Bear July 10 2008 Rose Garden Arena Portland Or", res);
})

app.get('/Pic2Calendar', function(req, res) {
    res.send("HI");
})

app.get('/Location', function(req, res) {
    res.send("HI");
})



app.get('/Pic2CalendarSample', function(req, res) {

    var startDate = new Date().toISOString();
    var event = new Calendar('Sample Event Name', startDate, startDate, 'Redmond', 'This is the sample description. The event is going to be epic!')
    a = JSON.stringify(event);
    res.send(a);
})

app.post('/api/photo', function(req, res) {
    upload(req, res, function(err) {
        if (err) {
            console.log(err);
            return res.end("Error uploading file.");
        }
        var startDate = new Date().toISOString();
        var event = new Calendar('Sample Event Name', startDate, startDate, 'Redmond', 'This is the sample description. The event is going to be epic!')
        a = JSON.stringify(event);
        res.send(a);
        //res.end("Uploaded.");
        //console.log(req.file.path);
    });
});

app.listen(3000, function() {
    console.log("Working on port 3000");
});


var Calendar = function(name, startDate, endDate, location, description) {
    this.Name = name;
    this.StartDate = startDate;
    this.EndDate = endDate;
    this.Location = location;
    this.Description = description;
};