var cramit = require('../libs/index.js')(),
    crave = require('crave'),
    express = require('express'),
    mongoose = require('mongoose'),
    path = require('path');

var databaseUri = 'mongodb://localhost/cramit',
  applicationPath = path.resolve("./app");

cramit.setConfig({
  database: {
    type: 'mongoose',
    instance: mongoose
  }
});

// Create an express application object.
var app = module.exports = express();

// Disable the "X-Powered-By: Express" HTTP header, which is enabled by default.
app.disable("x-powered-by");

var connectToDatabase = function(cb) {
  mongoose.connect(databaseUri);
  mongoose.connection.on('error', function(err) {
    console.log(err);
  });
  mongoose.connection.once('open', function() {
    cb();
  });
}



// Method to connect to database and start the server.
var start = function(err) {
  if(err) {
    console.log(err);
  } else {

    connectToDatabase(function() {
      
      var server = app.listen(3001, function() {
        var serverInfo = this.address();
        var address = (serverInfo.address === "0.0.0.0" || serverInfo.address === "::") ? "localhost" : serverInfo.address;

        console.log("Listening on http://%s:%s with database %s", address, serverInfo.port, databaseUri);

        cramit.findAllFixturesAndUpsertData(applicationPath, {}, function(err, results) {
          if(err) {
            console.log(err);
          } else {
            mongoose.model('User').find({}, function(err, users) {
              if(err) {
                console.log(err);
              } else {
                console.log("Users in database:  %s", users.length);

                /*cramit.findAndUnloadAllFixtures(applicationPath, {}, function(err) {
                  if(err) {
                    console.log(err);
                  } else {
                    mongoose.model('User').find({}, function(err, users) {
                      if(err) {
                        console.log(err);
                      } else {
                        console.log("Users in database:  %s", users.length);
                      }
                    });
                  }
                });*/
              }
            });
          }
        });
      });
    });
  }
};

// Configure Crave.
crave.setConfig({
  cache: {                    // Crave can store the list of files to load rather than create it each time.
    enable: false             // Disable caching of the list of files to load.  In production this should be enabled.
  },
  identification: {           // Variables related to how to find and require files are stored here.
    type: "filename",         // Determines how to find files.  Available options are: 'string', 'filename'
    identifier: "_"           // Determines how to identify the files.
  }
});

// Recursively load all files of the specified type(s) that are also located in the specified folder.
crave.directory(applicationPath, [ "model" ], start, app, cramit);
