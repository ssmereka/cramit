/* ************************************************** *
 * ******************** Library Global Variables
 * ************************************************** */

var async = require('async'),
  crave = require('crave'),
  path = require('path'),
  _ = require('lodash');

// Library component locations.
var fixturesFolder = path.resolve(__dirname, '.'+path.sep+'fixtures') + path.sep;
  databaseAdaptersFolder = path.resolve(__dirname, '.'+path.sep+'databaseAdapters') + path.sep;

// Default configuration object.
var defaultConfig = {
  database: {
    instance: undefined,
    type: undefined
  },
  crave: {
    cache: {                    // Crave can store the list of files to load rather than create it each time.
      enable: false             // Disable caching of the list of files to load.  In production this should be enabled.
    },
    identification: {           // Variables related to how to find and require files are stored here.
      type: "filename",         // Determines how to find files.  Available options are: 'string', 'filename'
      identifier: "_"           // Determines how to identify the files.
    }
  },
  fixture: {}
};

var defaultLogConfig = {
  name: 'Cramit'
}


/* ************************************************** *
 * ******************** Constructor
 * ************************************************** */

/**
 * Constructor to setup and initialize a new or existing
 * instance.
 *
 * @param {object|undefined} config is a cramit configuration object.
 * @param {object|undefined} log is a bunyan instance.
 * @param {object|undefined} error is a cramit-error instance.
 * @returns {object} the new or current Cramit instance.
 * @constructor
 */
var Cramit = function(config, log, error) {
  "use strict";

  // Auto instantiate the module when it is required.
  if(! (this instanceof Cramit)) {
    return new Cramit(config, log, error);
  } else {

    // Initalize the class with the passed parameters.
    this.setConfig(config, true);
    this.setLog(log);
    this.setError(error);

    // Initialize the fixture class with the cramit instance.
    this.Fixture = (require(fixturesFolder + 'index.js'))(this);

    return this;
  }
};


/* ************************************************** *
 * ******************** Initalize and Set Methods
 * ************************************************** */

/**
 * Set and apply new configurations for Cramit.
 * Any attribute included in the configuration 
 * object will overwrite the existing attribute.
 *
 * A config value of undefined will reset the 
 * configuration object to the default settings.
 *
 * @param {object|undefined} config is a Cramit
 * configuration object.
 * @param {boolean|undefined} initalize when true
 * will set the cramit's config instance to the 
 * default settings before applying the passed
 * configuration values.
 */
Cramit.prototype.setConfig = function(config, initalize) {
  if(initalize && ! this.config) {
    this.config = JSON.parse(JSON.stringify(defaultConfig));
  }

  if( ! config || ! _.isObject(config) && ! initalize) {
    this.config = JSON.parse(JSON.stringify(defaultConfig));
  } else {
    for(var key in config) {
      for(var subObjectKey in config[key]) {
        this.config[key][subObjectKey] = config[key][subObjectKey];
      }
    }
  }

  this.setDatabaseAdapter();
};

/**
 * Set or configure the Cramit bunyan log instace.
 *
 * Passing a value of undefined for both the config
 * and log parameters will initalize a new bunyan 
 * log instance with the default values.
 *
 * @param {object|undefined} config is a bunyan
 * configuration object.
 * @param {object|undefined} log is a bunyan instance.
 */
Cramit.prototype.setLog = function(config, log) {
  if(log) {
    this.log = log;
  } else {
    var bunyan = require('bunyan');
    this.log = bunyan.createLogger(config || defaultLogConfig);
  }
};

/**
 * Set or configure the Cramit error object.
 * The error object is used to build and display
 * errors that occur in Cramit.
 *
 * Passing a value of undefined for the error
 * object will reset the error object to the 
 * default. 
 *
 * @param {object|undefined} error is an object
 * with methods related to building error objects.
 */
Cramit.prototype.setError = function(error) {
  if(error) {
    this.error = error;
  } else {
    this.error = {
      build: function(message, code) {
        var err = new Error(message);
        err.status = code || 500;
        return err;
      }
    };
  }
};

/**
 * Set the database adapter to interact with the desired 
 * database.
 *
 * If the configuration object is undefined, then the current
 * configuraiton object will be used.
 *
 * @param {undefined|object} config is a cramit configuration
 * object.
 */
Cramit.prototype.setDatabaseAdapter = function(config) {
  var cramit = this;

  config = config || cramit.config;

  switch((config && config.database && config.database.type) ? config.database.type.toLowerCase(): "") {
    case 'mongoose':
      if( ! cramit.MongooseAdapter) {
        cramit.MongooseAdapter = require(databaseAdaptersFolder + 'mongoose.js');
      }

      cramit.databaseAdapter = cramit.MongooseAdapter(cramit);
      break;

    default:
      if( ! cramit.DatabaseAdapter) {
        cramit.DatabaseAdapter = require(databaseAdaptersFolder + 'index.js');
      }
      cramit.databaseAdapter = cramit.DatabaseAdapter(cramit.config, cramit.log);
      break;
  }
};


/* ************************************************** *
 * ******************** Public API
 * ************************************************** */

/**
 * Uses the module Crave to find all fixtures in a given 
 * directory.
 *
 * You can configure how Crave will find the fixtures
 * by passing in a configuration object as the options
 * parameter.  The key 'crave' will be passed directly
 * into the Crave module. 
 * 
 * The options object will also be passed as a parameter
 * into each fixture that is loaded.  However the crave
 * key will be removed.
 * 
 * @param {string} applicationPath is the path to your 
 * application's files where the fixtures can be found.
 * @param {object|undefined} options configure the fixtures
 * and how they will be loaded.
 * @param {fixtureCallbackMethod} cb is a callback method.
 */
Cramit.prototype.findAllFixtures = function(applicationPath, options, cb) {
  var cramit = this,
    fixtures = {};

  // Callback method is required, otherwise calling this method would be useless.
  if( ! cb) {
    return this.log.fatal(this.build.error('Callback is a required parameter for the cramit.finalAllFixtures() method.'), 500);
  }

  // Combine the default configurations with the options specified.
  if(options && options.crave) {
    crave.setConfig(options.crave);
    delete options.crave;
  } else {
    crave.setConfig(cramit.config.crave);
  }

  // Format the returned data object into a fixtures object, with
  // the fixture ID as the key and the fixture class as the value.
  var formatFixtures = function(err, files, results) {
    if(err) {
      cb(err);
    } else {
      for(var i = 0; i < results.length; i++) {
        if(results[i] !== undefined && results[i].error === undefined && results[i].id !== undefined) {
          fixtures[results[i].id] = results[i];
        }
      }
      cb(undefined, fixtures);
    }
  };

  

  // Recursively load all data files that are located in the apps folder.
  crave.directory(applicationPath, ["fixture"], formatFixtures, cramit, options);
}

/**
 * Uses the module Crave to find all fixtures in a given 
 * directory. Then inserts all data found in the fixtures.
 *
 * You can configure how Crave will find the fixtures
 * by passing in a configuration object as the options
 * parameter.  The key 'crave' will be passed directly
 * into the Crave module. 
 * 
 * The options object will also be passed as a parameter
 * into each fixture that is loaded.  However the crave
 * key will be removed.
 * 
 * @param {string} applicationPath is the path to your 
 * application's files where the fixtures can be found.
 * @param {object|undefined} options configure the fixtures
 * and how they will be loaded.
 * @param {fixtureCallbackMethod} cb is a callback method.
 */
Cramit.prototype.findAllFixturesAndInsertData = function(applicationPath, options, cb) {
  var cramit = this;

  if( ! cb) {
    cb = function(err) { if(err) { this.log.error(err); } };
  }

  cramit.findAllFixtures(applicationPath, options, function(err, fixtures) {
    if(err) {
      cb(err);
    } else {
      cramit.insertFixtureData(fixtures, cb);
    }
  });
}

/**
 * Uses the module Crave to find all fixtures in a given 
 * directory. Then deletes all data found in the fixtures.
 *
 * You can configure how Crave will find the fixtures
 * by passing in a configuration object as the options
 * parameter.  The key 'crave' will be passed directly
 * into the Crave module. 
 * 
 * The options object will also be passed as a parameter
 * into each fixture that is loaded.  However the crave
 * key will be removed.
 * 
 * @param {string} applicationPath is the path to your 
 * application's files where the fixtures can be found.
 * @param {object|undefined} options configure the fixtures
 * and how they will be loaded.
 * @param {fixtureCallbackMethod} cb is a callback method.
 */
Cramit.prototype.findAllFixturesAndRemoveData = function(applicationPath, options, cb) {
  var cramit = this;

  if( ! cb) {
    cb = function(err) { if(err) { this.log.error(err); } };
  }

  cramit.findAllFixtures(applicationPath, options, function(err, fixtures) {
    if(err) {
      cb(err);
    } else {
      cramit.removeFixtureData(fixtures, cb);
    }
  });
}

/**
 * Uses the module Crave to find all fixtures in a given 
 * directory. Then upsert all data found in the fixtures.
 *
 * Upsert refers to inserting the new data or 
 * updating the existing data.
 *
 * You can configure how Crave will find the fixtures
 * by passing in a configuration object as the options
 * parameter.  The key 'crave' will be passed directly
 * into the Crave module. 
 * 
 * The options object will also be passed as a parameter
 * into each fixture that is loaded.  However the crave
 * key will be removed.
 * 
 * @param {string} applicationPath is the path to your 
 * application's files where the fixtures can be found.
 * @param {object|undefined} options configure the fixtures
 * and how they will be loaded.
 * @param {fixtureCallbackMethod} cb is a callback method.
 */
Cramit.prototype.findAllFixturesAndUpsertData = function(applicationPath, options, cb) {
  var cramit = this;

  if( ! cb) {
    cb = function(err) { if(err) { this.log.error(err); } };
  }

  cramit.findAllFixtures(applicationPath, options, function(err, fixtures) {
    if(err) {
      cb(err);
    } else {
      cramit.upsertFixtureData(fixtures, cb);
    }
  });
}

/**
 * Must be called by a class that inherits Fixture in
 * the constructor. This will initialize any parameters
 * defined by the Fixture class.
 *
 * @param {object} instance is the class's instance.
 * @param {string} id is the class's unique identifier.
 */
Cramit.prototype.fixtureSuper = function(instance, id) {
  this.Fixture.call(instance, id);
};

/**
 * Must be called by a class that inherits Fixture and
 * the results must be stored as a prototype. For 
 * example:  
 *    MyFixture.prototype = cramit.fixturePrototype();
 *
 * @return {object} all Fixture prototype methods.
 */
Cramit.prototype.fixturePrototype = function() {
  return this.inherit(this.Fixture.prototype);
}

/**
 * Insert all data found in a list of fixtures.
 *
 * The fixtures parameter must be an object with
 * each fixture's ID as the key and class as the 
 * value.
 *
 * @param {object|undefined} fixtures is a fixture 
 * object that references one or more fixtures.
 * @param {cudCallback|undefined} is a callback method.
 */
Cramit.prototype.insertFixtureData = function(fixtures, cb) {
  var cramit = this,
    tasks = [];

  if( ! cb) {
    cb = function(err) { if(err) { this.log.error(err); } };
  }

  for(var id in fixtures) {
    if(fixtures.hasOwnProperty(id)) {
      tasks.push(this.createInsertAllFixtureDataMethod(fixtures[id]));
    }
  }

  async.parallel(tasks, cb);
};

/**
 * Delete all data found in a list of fixtures.
 *
 * The fixtures parameter must be an object with
 * each fixture's ID as the key and class as the 
 * value.
 *
 * @param {object|undefined} fixtures is a fixture 
 * object that references one or more fixtures.
 * @param {cudCallback|undefined} is a callback method.
 */
Cramit.prototype.removeFixtureData = function(fixtures, cb) {
  var cramit = this,
    tasks = [];

  if( ! cb) {
    cb = function(err) { if(err) { console.log(err); } };
  }

  for(var id in fixtures) {
    if(fixtures.hasOwnProperty(id)) {
      tasks.push(this.createDeleteAllFixtureDataMethod(fixtures[id]));
    }
  }

  async.parallel(tasks, cb);
};

/**
 * Upsert all data found in a list of fixtures.
 *
 * Upsert refers to inserting the new data or 
 * updating the existing data.
 *
 * The fixtures parameter must be an object with
 * each fixture's ID as the key and class as the 
 * value.
 *
 * @param {object|undefined} fixtures is a fixture 
 * object that references one or more fixtures.
 * @param {cudCallback|undefined} is a callback method.
 */
Cramit.prototype.upsertFixtureData = function(fixtures, cb) {
  var cramit = this,
    tasks = [];

  if( ! cb) {
    cb = function(err) { if(err) { cramit.log.error(err); } };
  }

  for(var id in fixtures) {
    if(fixtures.hasOwnProperty(id)) {
      tasks.push(this.createUpsertAllFixtureDataMethod(fixtures[id]));
    }
  }

  async.parallel(tasks, cb);
};


/* ************************************************** *
 * ******************** Private Methods
 * ************************************************** */

/**
 * Create an asynchronous method to delete all of a 
 * fixture's data in the database.
 *
 * @param {object} fixture is a fixture class instance.
 * @return {asyncFunction} the described method.
 */
Cramit.prototype.createDeleteAllFixtureDataMethod = function(fixture) {
  var cramit = this;

  return function(cb) {
    if(fixture.deleteAll !== undefined) {
      fixture.deleteAll(cb);
    } else {
      cramit.log.error('Fixture with id "%s" does not have a deleteAll() method.', fixture.id);
    }
  };
};

/**
 * Create an asynchronous method to insert all of a 
 * fixture's data into the database.
 *
 * @param {object} fixture is a fixture class instance.
 * @return {asyncFunction} the described method.
 */
Cramit.prototype.createInsertAllFixtureDataMethod = function(fixture) {
  var cramit = this;

  return function(cb) {
    if(fixture.insertAll !== undefined) {
      fixture.insertAll(cb);
    } else {
      cramit.log.error('Fixture with id "%s" does not have an insertAll() method.', fixture.id);
    }
  };
};

/**
 * Create an asynchronous method to upsert all of a 
 * fixture's data in the database.
 *
 * Upsert refers to inserting the new data or 
 * updating the existing data.
 *
 * @param {object} fixture is a fixture class instance.
 * @return {asyncFunction} the described method.
 */
Cramit.prototype.createUpsertAllFixtureDataMethod = function(fixture) {
  var cramit = this;

  return function(cb) {
    if(fixture.upsertAll !== undefined) {
      fixture.upsertAll(cb);
    } else {
      cramit.log.error('Fixture with id "%s" does not have an upsertAll() method.', fixture.id);
    }
  };
};

/**
 * A method used to aid in the creation of a class
 * that will inherit another class.  Used to generate
 * the proper prototype object that will be used
 * by the child class.
 */
Cramit.prototype.inherit = function(proto) {
  function F() {}
  F.prototype = proto;
  return new F;
};


/* ************************************************** *
 * ******************** Expose the Public API
 * ************************************************** */

exports = module.exports = Cramit;
exports = Cramit;


/* ************************************************** *
 * ******************** Documentation Stubs
 * ************************************************** */

/**
 * Fixtures are used to manage data.  This callback method 
 * will return an error or a fixture object.  A fixture 
 * object is one or more fixtures with the fixture ID as
 * the key and the fixture's class as a value.
 *
 * @callback fixtureCallbackMethod
 * @param {object|undefined} error describes the error that occurred.
 * @param {object|undefined} fixtures is a fixture object.
 */

/**
 * A callback used when fixture data is inserted, updated, 
 * or deleted in the database.  The result data will be an 
 * array of objects.  Each object will contain a transaction
 * and result key.  The result key's value will relate to the
 * data inserted, updated, or deleted.  The transaction key's
 * data will be related to the transaction used to modify the
 * data in the database.
 *
 * @callback cudCallback
 * @param {object|undefined} error describes the error that occurred.
 * @param {array|undefined} result is a list of objects with 
 * information related to the database action.
 */

/**
 * An asynchronous function that accepts only a callback as the parameter.
 * All results will be passed to the callback with the first parameter
 * being an error.
 *
 * @callback asyncFunction
 * @param {function} cb is a callback method.
 */

