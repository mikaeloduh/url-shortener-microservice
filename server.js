// server.js
// where your node app starts

// init project
var express = require('express');
var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;

var app = express();

var site = {name: "s1", url: "www"};

var uri = process.env.DBURI;
var baseURL = "https://jungle-list.glitch.me/";

mongoClient.connect(uri, (err, client) => {
  if (err) throw err;
  
  console.log("connected!");  
   
  var _db = client.db("shorturl");
  
  _db.createCollection("sites", {
        capped: true,
        size: 5242880,
        max: 5000
      });
  
  var sites = _db.collection("sites");
  
  // List all DB
  app.get("/", (request, response) => {
    response.sendFile(__dirname + '/views/index.html');
  });
  
    
  // Get a new short URL
  app.get("/new/:url(*)", (request, response) => {
    var orgURL = request.params.url;
    
    var regex = /((http|https):\/\/)(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gi;
    var output;
    
    if (regex.test(orgURL)) {
      // check if exit in database
      sites.find( {url: orgURL} ).toArray((err, data) => {
        if (err) throw err;
        
        var inRecord = data.length;
        if (inRecord === 0) {
          var hash = getHash();
          var doc = { url: orgURL, hash: hash };
          
          sites.insert(doc, (err, data) => {
            if (err) throw err;
            // client.close();
          });
          response.send({ url: orgURL, shortURL: baseURL + hash });
        }
        else if (inRecord === 1) {
          output = { url: orgURL, shortURL: baseURL + data[0].hash };
          response.send(output);
        }
        else {
          output = {error: "duplicate!!"};
          response.send(output);
        }
      
      });
      
    } else {
      output = {
        error: "invaild URL!"
      };
      response.send(output);
    }
    
  });
  
  // Resolve a short URL
  app.get("/:hash", (request, response) => {
    var hash = request.params.hash;
    // var docs;
    sites.find( {hash: hash} ).toArray((err, data) => {
      if (err) throw err;
      // console.log(data);
      if (data.length) {
        var orgURL = data[0].url;
        response.redirect(orgURL);
      } else {
        response.send({error: "URL not exit!"});
      }
    });

  
  });
  
  
  // For dev: List collection
  app.get("/dev/all", (request, response) => {
    sites.find({}).toArray((err, result) => {
      response.send(result);
    });
  });
  
  
  // For dev: Delete collection
  app.get("/dev/del", (request, response) => {
    sites.drop();
    response.send("Collection deleted!");
  });
  
  
  function getHash() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    
    sites.find( {hash: text} ).toArray((err, data) => {
      if (err) throw err;
      if (data.length)
        getHash();
    }); 

    return text;
  };
  
});


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

