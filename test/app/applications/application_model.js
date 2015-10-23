/**
 * Defines a mobile application in the server.
 */
module.exports = function() {


  /* ************************************************** *
   * ******************** Local Variables
   * ************************************************** *
   * Variables used only by this exported method.       */

  // External and internal modules.
  var db = require('mongoose');

  // Reference to the mongoose ObjectId type.
  var ObjectId = db.Schema.ObjectId;


  /* ************************************************** *
   * ******************** User Schema
   * ************************************************** *
   * The Mongoose data definition.                      */

  var Application = new db.Schema({
    android: {
      id: { type: String, sparse: true },
      packageName: { type: String, sparse: true },
      playStoreUrl: { type: String, sparse: true }
    },
    dateCreated: { type: Date, default: Date.now },
    deleted: { type: Boolean, required: true, default: false },
    deletedFromUsers: [{ type: ObjectId, ref: "User" }],
    description: { type: String },
    ios: {
      id: { type: String, sparse: true },
      itunesUrl: { type: String, sparse: true },
      urlScheme: { type: String, sparse: true }
    },
    lastUpdated: { type: Date, default: Date.now },
    lastUpdatedBy: { type: ObjectId, ref: "User" },
    name: { type: String, required: true, unique: true }
  });


  /* ************************************************** *
   * ******************** Exports
   * ************************************************** *
   * Export the model's methods and data so it can be
   * required by other parts of the application.        */

  db.model('Application', Application);


};