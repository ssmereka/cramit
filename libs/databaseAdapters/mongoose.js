module.exports = function(dm) {

  var path = require('path');
  var DatabaseAdapter = require(path.resolve(__dirname, '.'+path.sep+'index.js'));

  /* ************************************************** *
   * ******************** Global Variables
   * ************************************************** */

  var async, _;

  var config = dm.config,
    log = dm.log;

  var idAttributeName = '_id';

  /* ************************************************** *
   * ******************** Constructor & Inherit
   * ************************************************** */

  function MongooseAdapter() {
    if( ! dm.config.database.instance) {
      console.log("Mongoose is not defined.");
    }

    this.mongoose = dm.config.database.instance;

    if(!async) {
      async = require('async');
    }

    if( ! _) {
      _ = require('lodash');
    }

    DatabaseAdapter.call(this, config, log);
  }

  MongooseAdapter.prototype = dm.inherit(DatabaseAdapter.prototype);


  /* ************************************************** *
   * ******************** Mongoose Adapter Methods
   * ************************************************** */

  MongooseAdapter.prototype.addItem = function(schemaName, item, cb) {
    var adapter = this;

    var Model = adapter.mongoose.model(schemaName);
    new Model(item).save(function(err, newItem) {
      if(err) {
        cb(err);
      } else {
        //log.t("Added %s with id.", schemaName, newItem._id);
        //console.log("Added %s with id.", schemaName, newItem._id);
        cb(undefined, newItem);
      }
    });
  };

  MongooseAdapter.prototype.addItems = function(items, schemaName, cb) {
    var adapter = this;

    if(!_.isArray(items)) {
      items = [items];
    }

    async.each(items, function(item, next) {
      adapter.addItem(schemaName, item, next);
    }, cb);
  };

  MongooseAdapter.prototype.upsertItem = function(schemaName, item, cb) {
    var adapter = this,
      Model = adapter.mongoose.model(schemaName),
      query = {};
    
    query[idAttributeName] = item[idAttributeName];
    delete item[idAttributeName];
    
    Model.findOneAndUpdate(query, item, { 'new': true, 'upsert': true }, function(err, newItem) {
      if(err) {
        cb(err);
      } else {
        //log.t("Upsert %s with id.", schemaName, newItem._id);
        //console.log("Upsert %s with id %s", schemaName, newItem._id);
        cb(undefined, newItem);
      }
    });
  };

  MongooseAdapter.prototype.upsertItems = function(items, schemaName, cb) {
    var adapter = this;

    if(!_.isArray(items)) {
      items = [items];
    }

    var tasks = [];
    for(var i = 0; i < items.length; i++) {
      tasks.push(adapter.createUpsertItemMethod(schemaName, items[i]));
    }

    async.parallel(tasks, cb);
  };

  MongooseAdapter.prototype.createUpsertItemMethod = function(schemaName, item) {
    var adapter = this;

    return function(cb) { 
      adapter.upsertItem(schemaName, item, cb);
    }
  };

  MongooseAdapter.prototype.removeItem = function(schemaName, item, cb) {
    this.removeItemById(schemaName, item[idAttributeName], cb);
  };

  MongooseAdapter.prototype.removeItems = function(items, schemaName, cb) {
    if( ! _.isArray(items)) {
      items = [ items ];
    }

    var ids = [];
    for(var i = 0; i < items.length; i++) {
      ids.push(items[i][idAttributeName]);
    }

    this.removeItemsById(schemaName, ids, cb);
  };

  MongooseAdapter.prototype.removeItemsById = function(schemaName, ids, cb) {
    var adapter = this;

    if(!_.isArray(ids)) {
      ids = [ids];
    }

    async.each(ids, function (id, next) {
      adapter.removeItemById(schemaName, id, next)
    }, cb);
  };

  MongooseAdapter.prototype.removeItemById = function(schemaName, id, cb) {
    var adapter = this,
      Schema = adapter.mongoose.model(schemaName),
      query = {};

    query[idAttributeName] = id;

    Schema.findOne(query, function (err, data) {
      if (err) {
        cb(err);
      } else {
        if (data === undefined || data === null) {
          //adapter.log.t("Schema %s with item id %s already removed.", schemaName, id);
          cb();
        } else {
          data.remove(function(err, removedData) {
            if(err) {
              return cb(err);
            }

            //adapter.log.t("Schema %s with item id %s removed.", schemaName, data._id);
            cb();
          });
        }
      }
    });
  };


  /* ************************************************** *
   * ********************
   * ************************************************** */

  return new MongooseAdapter();
};