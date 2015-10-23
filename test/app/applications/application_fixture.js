module.exports = function(cramit, options) {

  var now = Date.now(),
    later;

  function ApplicationFixture() {
    cramit.fixtureSuper(this, 'Application');
  }

  ApplicationFixture.prototype = cramit.fixturePrototype();

  ApplicationFixture.prototype.getNew = function() {
    if( ! later) {
      later = Date.now();
    } 
    return {
      "_id": "100000000000000000000099",
      "android": {
        "id": "99000000-0000-0000-0000-000000000001",
        "packageName": "com.my.app.name.99",
        "playStoreUrl": "https://android.play.com/my/app/url/99"
      },
      "dateCreated": later,
      "deleted": false,
      "deletedFromUsers": [],
      "description": "This is an application",
      "ios": {
        "id": "99000000-0000-0000-0000-000000000002",
        "itunesUrl": "https://ios.appstore.com/my/app/url/99",
        "urlScheme": "myUrlSchema://99"
      },
      "lastUpdated": later,
      "lastUpdatedBy": "000000000000000000000099",
      "name": "My Application 99"
    };
  };

  ApplicationFixture.prototype.getAll = function() {
    return [
      {
        "_id": "100000000000000000000000",
        "android": {
          "id": "00000000-0000-0000-0000-000000000001",
          "packageName": "com.my.app.name.0",
          "playStoreUrl": "https://android.play.com/my/app/url/0"
        },
        "dateCreated": now,
        "deleted": false,
        "deletedFromUsers": [],
        "description": "This is an application",
        "ios": {
          "id": "00000000-0000-0000-0000-000000000002",
          "itunesUrl": "https://ios.appstore.com/my/app/url/0",
          "urlScheme": "myUrlSchema://0"
        },
        "lastUpdated": now,
        "lastUpdatedBy": "000000000000000000000000",
        "name": "My Application 0"
      },
      {
        "_id": "100000000000000000000001",
        "android": {
          "id": "10000000-0000-0000-0000-000000000001",
          "packageName": "com.my.app.name.1",
          "playStoreUrl": "https://android.play.com/my/app/url/1"
        },
        "dateCreated": now,
        "deleted": true,
        "deletedFromUsers": ["000000000000000000000001"],
        "description": "This is an application",
        "ios": {
          "id": "00000000-0000-0000-0000-000000000002",
          "itunesUrl": "https://ios.appstore.com/my/app/url/1",
          "urlScheme": "myUrlSchema://1"
        },
        "lastUpdated": now,
        "lastUpdatedBy": "000000000000000000000001",
        "name": "My Application 1"
      },
      {
        "_id": "100000000000000000000002",
        "android": {
          "id": "20000000-0000-0000-0000-000000000001",
          "packageName": "com.my.app.name.2",
          "playStoreUrl": "https://android.play.com/my/app/url/2"
        },
        "dateCreated": now,
        "deleted": false,
        "deletedFromUsers": [],
        "description": "This is an application",
        "ios": {
          "id": "20000000-0000-0000-0000-000000000002",
          "itunesUrl": "https://ios.appstore.com/my/app/url/2",
          "urlScheme": "myUrlSchema://2"
        },
        "lastUpdated": now,
        "lastUpdatedBy": "000000000000000000000002",
        "name": "My Application 2"
      }
    ];
  };

  return new ApplicationFixture();
};