module.exports = function(cramit, options) {

  var _ = require('lodash');


  /* ************************************************** *
   * ******************** Constructor
   * ************************************************** */

  /**
   * Constructor to setup and initialize a new Fixture.
   *
   * @param {string} id is a unique identifier for the 
   * Fixture.
   * @param {object|undefined} config is a fixture 
   * configuration object.
   * @param {object|undefined} log is a bunyan instance.
   */
  var Fixture = function(id, config, log) {
    this.db = cramit.databaseAdapter;

    this.id = id || 'UnknownFixtureId';
    this.config = config || cramit.config.fixture;
    this.log = log || cramit.log;
  };


  /* ************************************************** *
   * ******************** Public API
   * ************************************************** */

  /**
   * Insert all of the fixture's data into the database.
   *
   * @param {cudCallback} cb is a callback method.
   */
  Fixture.prototype.insertAll = function(cb) {
    this.db.add(this.getAll(), { fixtureId: this.id }, cb);
  };

  /**
   * Upsert all of the fixture's data in the database.
   *
   * Upsert refers to inserting the new data or 
   * updating the existing data.
   *
   * @param {cudCallback} cb is a callback method.
   */
  Fixture.prototype.upsertAll = function(cb) {
    this.db.upsert(this.getAll(), { fixtureId: this.id }, cb);
  };

  /**
   * Delete all of the fixture's data from the database.
   *
   * @param {cudCallback} cb is a callback method.
   */
  Fixture.prototype.deleteAll = function(cb) {
    this.db.remove(this.getAllAndNew(), { fixtureId: this.id }, cb);
  };

  /**
   * Find an item in the schema's database with the
   * specified ID.
   *
   * @param {crudOneItemCallback} cb is a callback 
   * method.
   */
  Fixture.prototype.findById = function(id, cb) {
    this.db.findItemById(this.id, id, cb);
  };

  /**
   * Find an item in the fixture's dataset with 
   * the specified ID.
   *
   * @param {crudOneItemCallback} cb is a callback 
   * method.
   */
  Fixture.prototype.findInDatasetById = function(id, cb) {
    var items = this.getAllAndNew();
    for(var i = 0; i < items.length; i++) {
      if(items[i][this.idAttributeName] == id) {
        return cb(undefined, items[i]);
      }
    }
    cb();
  };

  /**
   * Populates an item by ID if possible.  If an 
   * object is already populated it will just be 
   * returned.  If the value is not a valid, then 
   * undefined will be returned and a warning logged.
   * 
   * @param {object|string|undefined} value is the id to populate.
   * @param {crudOneItemCallback} is a callback method.
   */
  Fixture.prototype.populateId = function(value, cb) {
    if(_.isObject(value)) {
      cb(undefined, value);
    } else if(_.isString(value)){
      this.findById(value, cb);
    } else {
      cramit.log.w("Fixture.populateId():  Invalid value %s", value);
      cb(undefined, undefined);
    }
  };

  /**
   * Populates a list of items by ID if possible.  
   * If an object in the list is already populated
   * it will be left alone.  However if a value is,
   * not valid then undefined will be returned in 
   * it's place and a warning logged.
   * 
   * @param {array} values is the list of ids to populate.
   * @param {crudMultipleItemsCallback} is a callback method.
   */
  Fixture.prototype.populateIds = function(values, cb) {
    var fixture = this;

    var tasks = [];
    for(var i = 0; i < values.length; i++) {
      tasks.push(fixture.createPopulateIdMethod(values[i]))
    }
  
    async.parallel(tasks, cb);
  };

  /**
   * Populates an item by ID from the dataset if possible.  
   * If an object is already populated it will just be 
   * returned.  If the value is not a valid, then 
   * undefined will be returned and a warning logged.
   * 
   * @param {object|string|undefined} value is the id to populate.
   * @param {crudOneItemCallback} is a callback method.
   */
  Fixture.prototype.populateIdFromDataset = function(value, cb) {
    if(_.isObject(value)) {
      cb(undefined, value);
    } else if(_.isString(value)){
      this.findInDatasetById(value, cb);
    } else {
      cb(undefined, value);
    }
  };

  /**
   * Populates a list of items by ID from the dataset 
   * if possible.  If an object in the list is already 
   * populated it will be left alone.  However if a 
   * value is, not valid then undefined will be returned
   * in it's place and a warning logged.
   * 
   * @param {array} values is the list of ids to populate.
   * @param {crudMultipleItemsCallback} is a callback method.
   */
  Fixture.prototype.populateIdsFromDataset = function(values, cb) {
    var fixture = this;

    var tasks = [];
    for(var i = 0; i < values.length; i++) {
      tasks.push(fixture.createPopulateIdsFromDatasetMethod(values[i]))
    }
  
    async.parallel(tasks, cb);
  };

  /**
   * Fixtures that inherit this class should override
   * this method.
   * 
   * @return {object} a new item that is not already
   * in the main dataset.
   */
  Fixture.prototype.getNew = function() {
    return {};
  };

  /**
   * Fixtures that inherit this class should override
   * this method.
   * 
   * @return {array} the main list of items
   */
  Fixture.prototype.getAll = function() {
    return [];
  };

  /** 
   * @return {array} the entire list of items.
   */
  Fixture.prototype.getAllAndNew = function() {
    var items = this.getAll();
    items.push(this.getNew());
    return items;
  };

  /**
   * Compare two objects of the fixture's model 
   * type.  When strict checking is enabled, 
   * the two objects must be exactly the same.
   * When in non-strict mode, only certain attributes
   * will be checked for in the actual object.
   * 
   * Fixtures that inherit this class may want to 
   * override this method.
   * 
   * @param {Object} actual is the object to compare too.
   * @param {Object} expected is the object used to compare.
   * @param {compareCallback} cb is a callback method.
   * @param {Boolean} strict enables or disables strict mode.
   */
  Fixture.prototype.compare = function(actual, expected, cb, strict) {
    this.compareSuper(actual, expected, cb, strict);
  };

  /**
   * Compare two objects of the fixture's model 
   * type.  When strict checking is enabled, 
   * the two objects must be exactly the same.
   * When in non-strict mode, only attributes 
   * in expected will be checked for in the
   * actual object.
   * 
   * Fixtures that inherit this class may want to 
   * override the compare method.  They can then 
   * choose to call this super method to perform 
   * further checking.
   * 
   * @param {Object} actual is the object to compare too.
   * @param {Object} expected is the object used to compare.
   * @param {compareCallback} cb is a callback method.
   * @param {Boolean} strict enables or disables strict mode.
   */
  Fixture.prototype.compareSuper = function(actual, expected, cb, strict) {
    var fixture = this;

    // Make sure expected and actual are valid objects to compare to each other.
    if( ! expected || ! _.isObject(expected)) {
      if(actual === expected) {
        return cb(undefined, true);
      } else if(strict || ! actual || ! _.isObject(actual)) {
        return cb(undefined, false);
      } else {
        return cb(undefined, true);
      }

    // If the expected object is valid, check if the actual object is valid too.
    } else if( ! actual || ! _.isObject(actual)) {
      return cb(cramit.error.build('compare expected an object, but recieved ' + actual, 400), false);
    }

    var actualNumberAttributes = Object.keys(actual).length,
      expectedNumberAttributes = Object.keys(expected).length;

    // Make sure the expected number of attributes exist in the actual object.
    if(strict && actualNumberAttributes != expectedNumberAttributes) {
      return cb(cramit.error.build('object contains '+actualNumberAttributes+' attributes when '+expectedNumberAttributes+' attributes were expected in strict mode.', 400), false);
    }

    // Check for each expected attribute.
    for(var key in expected) {
      if(expected.hasOwnProperty(key)) {
        
        // In strict mode, every expected attribute must be defined.
        if( ! expected[key]) {
          if(strict === true) {
            return cb(cramit.error.build(fixture.id+' Fixture: '+key+' attribute is required in the expected object when using strict mode.'), false);
          }
        } else {

          switch(typeof expected[key]) {
            
            default:  // In strict mode, every attribute must be a model attribute.
              console.log(fixture.id+' Fixture: Unknown type: ' + typeof expected[key])
              //if(strict) {
              //  return cb(cramit.error.build('expecting an unknown attribute "'+key+'" is not allowed in strict mode.', 500), false);
             // }
              break;

            // Object ID?
            case 'object':
              //if( ! expected[key].equals(actual[key])) {
              //  return cb(cramit.error.build(key+' is "'+actual[key]+'" when expected to be "'+expected[key]+'".', 500), false);
             // }
              break;

            // Boolean
            case 'boolean':
              if(expected[key] !== actual[key]) {
                return cb(cramit.error.build(fixture.id+' Fixture: Boolean '+key+' is "'+actual[key]+'" when expected to be "'+expected[key]+'".', 500), false);
              }
              break;

            // Strings
            case 'string':
              if(expected[key] != actual[key]) {
                return cb(cramit.error.build(fixture.id+' Fixture: String '+key+' is "'+actual[key]+'" when expected to be "'+expected[key]+'".', 500), false);
              }
              break; 

            // Date
            case 'date':
              break; 

            // Number
            case 'number':
              if(expected[key] !== actual[key]) {
                if(_.isDate(actual[key]) || _.isDate(expected[key])) {
                  if(fixture.dateDiff(new Date(actual[key]), new Date(expected[key])) === 0) {
                    return cb(undefined, true);
                  }
                }
                return cb(cramit.error.build(fixture.id+' Fixture: Number '+key+' is "'+actual[key]+'" when expected to be "'+expected[key]+'".', 500), false);
              }
              break;
          }

        }
      }
    }

    cb(undefined, true);
  };


  /* ************************************************** *
   * ******************** Private API
   * ************************************************** */

  /**
   * Returns the difference between two dates.  A Positive
   * number is a date in the future where negative is in the past.
   * If either parameter is not a valid date, undefined will be returned.
   * @param a is the minuend date value.
   * @param b is the subtrahend date value.
   * @param isDLS when true the remainder will include Daylight Savings Time.
   */
  Fixture.prototype.dateDiff = function(a, b, isDLS) {
    if(_.isDate(a) && _.isDate(b)) {
      if(isDLS) {
        return (a.getTime() - b.getTime());
      } else {
        // Discard the time and time-zone information.
        var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
        return (utc1 - utc2);
      }
    }

    return undefined;
  };

  /**
   * Create an asynchronous method to populate an ID.
   * @param {object|string|undefined} value is the id to populate.
   * @return {asyncFunction} is populateId method.
   */
  Fixture.prototype.createPopulateIdMethod = function(value) { 
    var fixture = this;
    return function(cb) {
      fixture.populateId(value, cb);
    }
  };

  /**
   * Create an asynchronous method to populate an ID using 
   * the fixture's dataset.
   * @param {object|string|undefined} value is the id to populate.
   * @return {asyncFunction} is populateId method.
   */
  Fixture.prototype.createPopulateIdFromDatasetMethod = function(value) { 
    var fixture = this;
    return function(cb) {
      fixture.populateIdFromDataset(value, cb);
    }
  };


  /* ************************************************** *
   * ******************** Expose Fixture
   * ************************************************** */

  return Fixture;

};


/* ************************************************** *
 * ******************** Documentation Stubs
 * ************************************************** */

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
 * A callback used when fixture data is queried, inserted, 
 * updated, or deleted in the database or dataset.  The 
 * result data will be the object or modified object.
 *
 * @callback crudOneItemCallback
 * @param {object|undefined} error describes the error that 
 * occurred.
 * @param {object|undefined} result is the object.
 */

/**
 * A callback used when fixture data is queried, inserted, 
 * updated, or deleted in the database or dataset.  The 
 * result data will be an array of objects or modified objects.
 *
 * @callback crudMultipleItemsCallback
 * @param {object|undefined} error describes the error that 
 * occurred.
 * @param {array|undefined} result is the array of objects.
 */

/**
 * An asynchronous function that accepts only a callback as the parameter.
 * All results will be passed to the callback with the first parameter
 * being an error.
 *
 * @callback asyncFunction
 * @param {function} cb is a callback method.
 */

/**
 * A callback used to return the results of comparing two 
 * objects.
 *
 * @callback compareCallback
 * @param {object|undefined} error describes the error that 
 * occurred.
 * @param {boolean} result describes if the two objects are 
 * equal or not.
 */