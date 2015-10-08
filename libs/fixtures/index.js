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

  Fixture.prototype.findById = function(id, cb) {
    var items = this.getAll();
    for(var i = 0; i < items.length; i++) {
      if(items[i]._id == id) {
        return cb(undefined, items[i]);
      }
    }
    cb();
  };

  Fixture.prototype.populate = function(v, cb) {
    if( ! user) {
      cb();
    } else if(_.isObject(v)) {
      cb(undefined, v);
    } else if(_.isString(v)){
      this.findById(v, cb);
    } else {
      cb();
    }
  };

  Fixture.prototype.getNew = function() {
    return {};
  };

  Fixture.prototype.getAll = function() {
    return [];
  };

  Fixture.prototype.getAllAndNew = function() {
    var items = this.getAll();
    items.push(this.getNew());
    return items;
  };

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

