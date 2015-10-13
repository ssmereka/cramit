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
    this.db.add(this.getAll(), this.id, cb);
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
    this.db.upsert(this.getAll(), this.id, cb);
  };

  /**
   * Delete all of the fixture's data from the database.
   *
   * @param {cudCallback} cb is a callback method.
   */
  Fixture.prototype.deleteAll = function(cb) {
    this.db.remove(this.getAllAndNew(), this.id, cb);
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


  /* ************************************************** *
   * ******************** Private API
   * ************************************************** */

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
  }

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
  }


  /* ************************************************** *
   * ******************** Expose Fixture
   * ************************************************** */

  return Fixture;

}


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

