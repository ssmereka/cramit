/* ************************************************** *
 * ******************** Global Variables
 * ************************************************** */

var _ = require("lodash");


/* ************************************************** *
 * ******************** Constructor
 * ************************************************** */

/**
 * Constructor to setup and initialize a new Database
 * Adapter.
 *
 * @param {object|undefined} config is a database 
 * adapter configuration object.
 * @param {object|undefined} log is a bunyan instance.
 */
var DatabaseAdapter = function(config, log) {
  this.config = config;
  this.log = log;
};


/* ************************************************** *
 * ******************** Transaction Methods
 * ************************************************** */

/**
 * Called before any database action is taken.  Allows
 * the adapter to track actions or pre-perform tasks.
 *
 * Notice:  This method should be overridden by any 
 * classes that inherit DatabaseAdapter and require
 * transactions.
 * 
 * @param {string} type is the type of transaction.
 * @param {object} item is the object to be modified 
 * or queried.
 * @param {object} options is any additional settings 
 * included with the database operation.
 * @param  {transactionCallback} is a callback method.
 */
DatabaseAdapter.prototype.startTransaction = function(type, item, options, cb) {
  cb(undefined, {});
};

/**
 * Called when any database action is finished leaving 
 * the transaction completed.  This allows the adapter 
 * to track the result or perform post tasks.
 *
 * Notice:  This method should be overridden by any 
 * classes that inherit DatabaseAdapter and require
 * transactions.
 * 
 * @param {object} transaction is the transaction object.
 * @param  {transactionCallback} is a callback method.
 */
DatabaseAdapter.prototype.endTransaction = function(transaction, cb) {
  cb(undefined, transaction);
};

/**
 * Called when any database action has failed. This 
 * allows the adapter to track the result or tasks.
 *
 * Notice:  This method should be overridden by any 
 * classes that inherit DatabaseAdapter and require
 * transactions.
 * 
 * @param {object} transaction is the transaction object.
 * @param {array|object} err is the error or errors that 
 * occurred.
 * @param  {transactionCallback} is a callback method.
 */
DatabaseAdapter.prototype.failedTransaction = function(transaction, err, cb) {
  cb(undefined, transaction);
};


/* ************************************************** *
 * ******************** Database Methods
 * ************************************************** */

DatabaseAdapter.prototype.add = function(items, options, cb) {
  var database = this;
  database.startTransaction('insert', {}, options, function(err, transaction) {
    if(err) {
      cb(err, { transaction: transaction, results: [] });
    } else {
      database.addItems(items, options, function(err, results) {
        if(err) {
          database.failedTransaction(transaction, err, function(transactionError, transaction) {
            if(transactionError) {
              cb([err, transactionError], { transaction: transaction, results: results });
            } else {
              cb(err, { transaction: transaction, results: results });
            }
          });
        } else {
          database.endTransaction(transaction, function(err, transaction) {
            if(err) {
              cb(err, { transaction: transaction, results: results });
            } else {
              cb(err, { transaction: transaction, results: results });
            }
          });
        }
      });
    }
  });
};

DatabaseAdapter.prototype.upsert = function(items, options, cb) {
  var database = this;
  database.startTransaction({}, function(err, transaction) {
    if(err) {
      cb(err, { transaction: transaction, results: [] });
    } else {
      database.upsertItems(items, options, function(err, results) {
        if(err) {
          database.failedTransaction(transaction, err, function(transactionError, transaction) {
            if(transactionError) {
              cb([err, transactionError], { transaction: transaction, results: results });
            } else {
              cb(err, { transaction: transaction, results: results });
            }
          });
        } else {
          database.endTransaction(transaction, function(err, transaction) {
            if(err) {
              cb(err, { transaction: transaction, results: results });
            } else {
              cb(undefined, { transaction: transaction, results: results });
            }
          });
        }
      });
    }
  });
};


DatabaseAdapter.prototype.addMethod = function(items, options) {
  var database = this;

  return function(cb) {
    database.add(items, options, cb);
  }
};

DatabaseAdapter.prototype.remove = function(items, options, cb) {
  var database = this;
  database.startTransaction({}, function(err, transaction) {
    if(err) {
      cb(err, { transaction: transaction, results: [] });
    } else {
      database.removeItems(items, options, function(err, results) {
        if(err) {
          database.failedTransaction(transaction, err, function(transactionError, transaction) {
            if(transactionError) {
              cb([err, transactionError], { transaction: transaction, results: results });
            } else {
              cb(err, { transaction: transaction, results: results });
            }
          });
        } else {
          database.endTransaction(transaction, function(err, transaction) {
            if(err) {
              cb(err, { transaction: transaction, results: results });
            } else {
              cb(err, { transaction: transaction, results: results });
            }
          });
        }
      });
    }
  });
};

DatabaseAdapter.prototype.removeMethod = function(items, options) {
  var database = this;

  return function(cb) {
    database.remove(items, options, cb);
  }
};


/* ************************************************** *
 * ******************** Expose API
 * ************************************************** */

exports = module.exports = DatabaseAdapter;
exports = DatabaseAdapter;


/* ************************************************** *
 * ******************** Documentation Stubs
 * ************************************************** */

/**
 * A callback used when a single database transaction 
 * starts, ends, fails, searched, or modified.
 *
 * @callback transactionCallback
 * @param {object|undefined} error describes the error that 
 * occurred.
 * @param {object|undefined} transaction is the transaction 
 * that was modified or found.
 */

