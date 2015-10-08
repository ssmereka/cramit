module.exports = function(cramit, options) {

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
      "failedLoginAttempts": 0,
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
        "failedLoginAttempts": 0,
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
        "failedLoginAttempts": 0,
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
        "failedLoginAttempts": 0,
        "password": "password",
        "securityQuestion": "What is your favorite color",
        "securityAnswer": "I'm Blind"
      },
    ];
  };

  return new UserFixture();
};