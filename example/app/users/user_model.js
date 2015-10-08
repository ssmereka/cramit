/**
 * Defines a user account in the application.
 * @param app is the express application object.
 * @param config is the server's configuration object.
 * @param log is the server's current logger instance.
 */
module.exports = function(app, config, log) {


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

  var User = new db.Schema({
    // Flags a user as activated or deactivated.  User's
    // that are deactivated will not be authenticated.
    activated: {
      default: true,
      type: Boolean
    },

    // Date and time the user object was created.
    dateCreated: {
      default: Date.now,
      type: Date
    },

    // A message describing why a user was deactivated.
    // Can be displayed to the user or other admins.
    deactivatedMessage: {
      default: "",
      type: String
    },

    // Marks the user object as deleted without actually
    // loosing the user's information.
    deleted: {
      default: false,
      type: Boolean
    },

    // User's email address.
    email: {
      lowercase: true,
      sparse: true,
      trim: true,
      type: String
    },

    // Keeps track of the number of failed security attempts
    // (e.g. failed login, password reset, security question)
    // since the last successful login.  Used to detect
    // break-in attempts.
    failedSecurityAttempts: {
      default: 0,
      type: Number
    },

    // Date and time the user last logged in.
    lastLogin: {
      default: Date.now,
      type: Date
    },

    // Date and time the user object was last updated by a user.
    lastUpdated: {
      default: Date.now,
      type: Date
    },

    // User who last updated the object.
    lastUpdatedBy: {
      ref: 'User',
      type: ObjectId
    },

    // Stores the user's calculated password hash, salt, and
    // other cryptography related information.
    passwordHash: {
      default: "",
      type: String
    },

    // A password reset token is generated to authenticate a
    // user while resetting a forgotten password.  The
    // calculated password reset hash, salt, and other
    // cryptography related information is stored here.
    passwordResetHash: {
      default: "",
      type: String
    },

    // A security challenge given to a user as an alternate
    // or additional means of authentication.
    securityQuestion: {
      default: "Which of your children is your favorite?",
      trim: true,
      type: String
    },

    // The expected response to the security question is
    // stored here along with the salt and other cryptography
    // related information.
    securityAnswerHash: {
      default: "",
      type: String
    }

  });

  var UserSchema = db.model('User', User);

};