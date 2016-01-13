
/* ************************************************** *
 * ******************** Private Variables
 * ************************************************** */

var assert = require('assert'),
    async = require('async'),
    cramit = require('../../libs/index.js')(),
    //cramit = Cramit(),
    crave = require('crave'),
    fs = require("fs"),
    mongoose = require('mongoose'),
    path = require("path"),
    should = require("should"),
    _ = require("lodash");

var cramitDefaultConfig = {
  database: {
    connectionUri: 'mongodb://localhost/cramit',
    type: 'mongoose',
    instance: mongoose
  }
};
//cramit = Cramit(cramitDefaultConfig);
//cramit.setConfig(cramitDefaultConfig);

var applicationPath = path.resolve('./test/app');

var ApplicationFixture = require('../app/applications/application_fixture.js'),
  ApplicationModel = require('../app/applications/application_model.js'),
  UserFixture = require('../app/users/user_fixture.js'),
  UserModel = require('../app/users/user_model.js');  


var allFixturesArray,
  allFixturesObject,
  allFixtureDataObject,
  applicationFixture,
  userFixture;

/* ************************************************** *
 * ******************** Private Methods
 * ************************************************** */

var loadModels = function(cb) {
  // Configure Crave.
  crave.setConfig({
    error: true,
    cache: {                    // Crave can store the list of files to load rather than create it each time.
      enable: false             // Disable caching of the list of files to load.  In production this should be enabled.
    },
    identification: {           // Variables related to how to find and require files are stored here.
      type: "filename",         // Determines how to find files.  Available options are: 'string', 'filename'
      identifier: "_"           // Determines how to identify the files.
    }
  });

  // Recursively load all files of the specified type(s) that are also located in the specified folder.
  crave.directory(applicationPath, [ "model" ], cb);
};

var loadFixtures = function(cb) {
  userFixture = UserFixture(cramit);
  applicationFixture = ApplicationFixture(cramit);

  cramit.findAllFixtures(applicationPath, {}, function(err, fixtures) {
    if(err) {
      cb(err);
    } else {
      allFixturesObject = fixtures;
      allFixturesArray = [];
      allFixtureDataObject = {};
      for(var key in fixtures) {
        if(fixtures.hasOwnProperty(key)) {
          allFixturesArray.push(fixtures[key]);
          allFixtureDataObject[key] = fixtures[key].getAll();
        }
      }
      cb();
    }
  });
};

var toUserExpectedValue = function(obj) {
  if( ! obj['passwordHash'] && obj['password']) {
    obj['passwordHash'] = obj['password'];
  }
  return obj;
};


var createCompareMethod = function(fixture, actual, expected, strict) {
  return function(cb) {
    fixture.compare(actual, expected, cb, strict);
  }
};

var verifyCrudResult = function(actual, expected, cb) {
  assert.equal(_.isArray(actual), true);

  var tasks = [];

  for(var x = 0; x < actual.length; x++) {
    assert.equal(_.isObject(actual[x]), true);
    assert.equal(_.isObject(actual[x]['transaction']), true);
    assert.equal(_.isArray(actual[x]['results']), true);
    assert.equal(_.isString(actual[x]['fixtureId']), true);

    for(var y = 0; y < actual[x]['results'].length; y++) {
      tasks.push(createCompareMethod(allFixturesObject[actual[x]['fixtureId']], actual[x]['results'][y], expected[actual[x]['fixtureId']][y], false));
    }
  }

  async.series(tasks, function(err, results) {
    if(err) {
      cb(err);
    } else {
      cb();
    }
  });
};


/* ************************************************** *
 * ******************** Test Suite
 * ************************************************** */

describe('Cramit', function() {

  before(function(done) {
    cramit.setConfig(cramitDefaultConfig);
    loadModels(function(err, results, values) {
      if(err) {
        done(err);
      } else {
        loadFixtures(done);
      }
    });
  });

  afterEach(function(done) {
    cramit.setConfig();
    cramit.setConfig(cramitDefaultConfig);
    cramit.setLog();
    cramit.setError();
    cramit.removeFixtureData(allFixturesObject, done);
  });

  describe('fixture', function() {

    it('insert method should accept a single fixture and load all data.', function(done) {
      var expected = {};
        expected[userFixture.id] = userFixture.getAll();

      cramit.insertFixtureData(userFixture, function(err, results) {
        if(err) {
          done(err);
        } else {          
          verifyCrudResult(results, expected, done);
        }
      });
    });

    it('remove method should accept a single fixture and remove all inserted data.', function(done) {
      var expected = {};
      expected[userFixture.id] = userFixture.getAll();

      cramit.insertFixtureData(userFixture, function(err, results) {
        if(err) {
          done(err);
        } else {
          verifyCrudResult(results, expected, function(err) {
            if(err) {
              done(err);
            } else {
              cramit.removeFixtureData(userFixture, function(err, results) {
                if(err) {
                  done(err);
                } else {
                  verifyCrudResult(results, expected, done);
                }
              });
            }
          });
        }
      });
    });

    it('upsert method should accept a single fixture and inserted all new data.', function(done) {
      var expected = {};
      expected[userFixture.id] = userFixture.getAll();

      cramit.upsertFixtureData(userFixture, function(err, results) {
        if(err) {
          done(err);
        } else {
          verifyCrudResult(results, expected, done);
        }
      });
    });

    it('upsert method should accept a single fixture and update all existing data.', function(done) {
      var expected = {};
      expected[userFixture.id] = userFixture.getAll();

      cramit.insertFixtureData(userFixture, function(err, results) {
        if(err) {
          done(err);
        } else {
          verifyCrudResult(results, expected, function(err) {
            if(err) {
              done(err);
            } else {
              cramit.upsertFixtureData(userFixture, function(err, results) {
                if(err) {
                  done(err);
                } else {
                  verifyCrudResult(results, expected, done);
                }
              });
            }
          });
        }
      });
    });

    it('insert method should accept an array of fixtures and load all data.', function(done) {
      cramit.insertFixtureData(allFixturesArray, function(err, results) {
        if(err) {
          done(err);
        } else {
          verifyCrudResult(results, allFixtureDataObject, done);
        }
      });
    });

    it('remove method should accept an array of fixtures and remove all inserted data.', function(done) {
      cramit.insertFixtureData(allFixturesArray, function(err, results) {
        if(err) {
          done(err);
        } else {
          verifyCrudResult(results, allFixtureDataObject, function(err) {
            if(err) {
              done(err);
            } else {
              cramit.removeFixtureData(allFixturesArray, function(err, results) {
                if(err) {
                  done(err);
                } else {
                  verifyCrudResult(results, allFixtureDataObject, done);
                }
              });
            }
          });
        }
      });
    });

    it('upsert method should accept an array of fixtures and inserted all new data.', function(done) {
      cramit.upsertFixtureData(allFixturesArray, function(err, results) {
        if(err) {
          done(err);
        } else {
          verifyCrudResult(results, allFixtureDataObject, done);
        }
      });
    });

    it('upsert method should accept an array of fixtures and update all existing data.', function(done) {
      cramit.insertFixtureData(allFixturesArray, function(err, results) {
        if(err) {
          done(err);
        } else {
          verifyCrudResult(results, allFixtureDataObject, function(err) {
            if(err) {
              done(err);
            } else {
              cramit.upsertFixtureData(allFixturesArray, function(err, results) {
                if(err) {
                  done(err);
                } else {
                  verifyCrudResult(results, allFixtureDataObject, done);
                }
              });
            }
          });
        }
      });
    });

  });
});