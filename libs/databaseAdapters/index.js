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
 * @param {object|array} items is the object or list 
 * of objects to be modified or queried.
 * @param {object} options is any additional settings 
 * included with the database operation.
 * @param  {transactionCallback} is a callback method.
 */
DatabaseAdapter.prototype.startTransaction = function(type, items, options, cb) {
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

/**
 * Insert one or more items to the database.
 * 
 * @param {object|array} items is a single or list of 
 * objects to be added.
 * @param {object} options specifies any special requests 
 * to be made when inserting the items.
 * @param {cudCallback} is a callback method.
 */
DatabaseAdapter.prototype.add = function(items, options, cb) {
  var database = this;
  database.startTransaction('insert', items, options, function(err, transaction) {
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

/**
 * Upsert one or more items to the database.
 * 
 * @param {object|array} items is a single or list of 
 * objects to be upserted.
 * @param {object} options specifies any special requests 
 * to be made when upserting the items.
 * @param {cudCallback} is a callback method.
 */
DatabaseAdapter.prototype.upsert = function(items, options, cb) {
  var database = this;
  database.startTransaction('upsert', items, options, function(err, transaction) {
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

/**
 * Remove one or more items from the database.
 * 
 * @param {object|array} items is a single or list of 
 * objects to be removed.
 * @param {object} options specifies any special requests 
 * to be made when removing the items.
 * @param {cudCallback} is a callback method.
 */
DatabaseAdapter.prototype.remove = function(items, options, cb) {
  var database = this;
  database.startTransaction('delete', items, options, function(err, transaction) {
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