module.exports = function(cramit, options) {

  var _ = require('lodash');


  function UserFixture() {
    cramit.fixtureSuper(this, 'User');
  }

  UserFixture.prototype = cramit.fixturePrototype();

  UserFixture.prototype.getNew = function() {
    var now = Date.now();
    return {
      "_id": "000000000000000000000099",
      "activated": true,
      "dateCreated": now,
      "deactivatedMessage": "",
      "deleted": false,
      "email": "newUser@localhost.com",
      "failedSecurityAttempts": 0,
      "lastLogin": now,
      "lastUpdated": now,
      "lastUpdatedBy": "000000000000000000000000",
      "password": "password",
      "securityQuestion": "What is your favorite color",
      "securityAnswer": "Blue. No, yel..."
    };
  };

  UserFixture.prototype.getAll = function() {
    return [
      {
        "_id": "000000000000000000000000",
        "activated": true,
        "deactivatedMessage": "",
        "deleted": false,
        "email": "000000000000000000000000@localhost.com",
        "failedSecurityAttempts": 0,
        "password": "password",
        "securityQuestion": "What is your favorite color?",
        "securityAnswer": "I'm Blind"
      },
      {
        "_id": "000000000000000000000001",
        "activated": false,
        "deactivatedMessage": "",
        "deleted": false,
        "email": "000000000000000000000001@localhost.com",
        "failedSecurityAttempts": 0,
        "password": "password",
        "securityQuestion": "What is your favorite color",
        "securityAnswer": "I'm Blind"
      },
      {
        "_id": "000000000000000000000002",
        "activated": true,
        "deactivatedMessage": "",
        "deleted": true,
        "email": "000000000000000000000002@localhost.com",
        "failedSecurityAttempts": 0,
        "password": "password",
        "securityQuestion": "What is your favorite color",
        "securityAnswer": "I'm Blind"
      },
    ];
  };

  UserFixture.prototype.compare = function(actual, expected, cb, strict) {
    if(expected && _.isObject(expected)) {
      expected = JSON.parse(JSON.stringify(expected));
      delete expected.password;
      delete expected.securityAnswer;
    }

    this.compareSuper(actual, expected, cb, strict);
  };

  /*UserFixture.prototype.compare = function(actual, expected, cb, strict) {
    var actualNumberAttributes = Object.keys(actual).length,
      expectedNumberAttributes = Object.keys(expected).length;

    console.log(actual);
    console.log(expected)

    // Make sure the expected number of attributes exist in the actual object.
    if(strict && actualNumberAttributes != expectedNumberAttributes) {
      return cb(cramit.error.build('object contains '+actualNumberAttributes+' attributes when '+expectedNumberAttributes+' attributes were expected in strict mode.'), false);
    }
    //if(actualNumberAttributes < expectedNumberAttributes) {
    //  return cb(cramit.error.build('object contains '+actualNumberAttributes+' attributes when '+expectedNumberAttributes+' attributes were expected.', 500), false);
    //} else if(actualNumberAttributes > expectedNumberAttributes && strict) {
    //  return cb(cramit.error.build('object contains '+actualNumberAttributes+' attributes when '+expectedNumberAttributes+' attributes were expected in strict mode.'), false);
    //}

    // Check for each expected attribute.
    for(var key in expected) {
      if(expected.hasOwnProperty(key)) {
        //console.log(expected[key]);
        // In strict mode, every expected attribute must be defined.
        if( ! expected[key]) {
          if(strict === true) {
            return cb(cramit.error.build(key+' attribute is required in the expected object when using strict mode.'), false);
          }
        } else {
          switch(key) {
            
            default:  // In strict mode, every attribute must be a model attribute.
              if(strict) {
                return cb(cramit.error.build('expecting an unknown attribute "'+key+'" is not allowed in strict mode.', 500), false);
              }
              break;

            // Object ID
            case '_id':
            case 'lastUpdatedBy':
              if( (expected[key]['equals'] && ! expected[key].equals(actual[key])) || (expected[key] != actual[key]) ) {
                return cb(cramit.error.build(key+' is "'+actual[key]+'" when expected to be "'+expected[key]+'".', 500), false);
              }
              break;

            // Boolean
            case 'activated':
            case 'deleted':
              if(expected[key] !== actual[key]) {
                return cb(cramit.error.build(key+' is "'+actual[key]+'" when expected to be "'+expected[key]+'".', 500), false);
              }
              break;

            // Strings
            case 'deactivatedMessage':
            case 'email':
            case 'securityQuestion':
              if(expected[key] !== actual[key]) {
                return cb(cramit.error.build(key+' is "'+actual[key]+'" when expected to be "'+expected[key]+'".', 500), false);
              }
              break; 

            case 'securityAnswer':
            case 'password':
              break;  

            // Date
            case 'dateCreated':
            case 'lastLogin':
            case 'lastUpdated':
              break; 

            // Number
            case 'failedSecurityAttempts':
              if(expected[key] !== actual[key]) {
                return cb(cramit.error.build(key+' is "'+actual[key]+'" when expected to be "'+expected[key]+'".', 500), false);
              }
              break;
          }

        }
      }
    }

    cb(undefined, true);
  }*/

  return new UserFixture();
};