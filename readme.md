# Cramit

<a href="https://nodei.co/npm/cramit/" target="_blank"><img src="https://nodei.co/npm/cramit.png?downloads=true&downloadRank=true"></a>

<a href="https://travis-ci.org/ssmereka/cramit" target="_blank"><img src="https://travis-ci.org/ssmereka/cramit.svg" /></a> <a href="https://david-dm.org/ssmereka/cramit" target="_blank"><img src="https://david-dm.org/ssmereka/cramit.svg" /></a> <a href="https://gratipay.com/ScottSmereka/" target="_blank"><img src="http://img.shields.io/gratipay/ScottSmereka.svg" /> <a href="https://codecov.io/github/ssmereka/cramit?branch=master" target="_blank"><img src="https://codecov.io/github/ssmereka/cramit/coverage.svg?branch=master" /></a>

Cram data into your database easily for testing, demos, or whatever.


# Getting Started

Install Cramit using npm and save it as a dependency in your package.json.

```javascript
npm install cramit --save
```

You can require Cramit just like every other node.js module.

```javascript
var cramit = require('cramit');
```

In order to define the data that will be added or removed from the database one or more [fixtures](https://github.com/ssmereka/cramit#fixture) must be created.

Note: The fixture file names must follow the configuration you set for <a href="https://github.com/ssmereka/crave/blob/master/readme.md#config" target="_blank">Crave</a> in [Cramit's configuration object](https://github.com/ssmereka/cramit#config).  By default, Crave looks for and requires any file that contains "_fixture" in the name.

```javascript
// Filename: user_fixture.js

module.exports = function(cramit, options) {

  function UserFixture() {
    cramit.fixtureSuper(this, 'User');
  }

  UserFixture.prototype = cramit.fixturePrototype();

  // Returns a new user not already in the database.
  UserFixture.prototype.getNew = function() {
    return {
      "_id": "999999999999999999999999",
      "activated": true,
      "email": "kevin@gmail.com",
      "name": "Kevin Mitnick"
    };
  };

  // Returns a list of users to be added/removed from the database.
  UserFixture.prototype.getAll = function() {
    return [
      {
        "_id": "000000000000000000000000",
        "activated": true,
        "email": "charlie@gmail.com",
        "name": "Charlie Kelly"
      },
      {
        "_id": "000000000000000000000001",
        "activated": false,
        "email": "macsmom@gmail.com",
        "name": "Mac's Mom"
      }
    ];
  };

  return new UserFixture();
};
```

After the fixtures have been created you can call <a href="https://github.com/ssmereka/cramit/wiki/API#find-all-fixtures-and-upsert-data" target="_blank">findAllFixturesAndUpsertData()</a>.  This will search for all fixture files and upsert the data returned from each fixture's <a href="https://github.com/ssmereka/cramit/wiki/Fixture#get-all" target="_blank">getAll()</a> method.

```javascript
cramit.findAllFixturesAndUpsertData(applicationPath, {}, function(err, results) {
  if(err) {
    console.log(err);
  } else {
    console.log(results);
  }
});
```


# API
The Cramit API consists of the following methods.

  * <a href="https://github.com/ssmereka/cramit/wiki/API#find-all-fixtures" target="_blank">Find All Fixtures</a>
  * <a href="https://github.com/ssmereka/cramit/wiki/API#find-all-fixtures-and-insert-data" target="_blank">Find All Fixtures and Insert Data</a>
  * <a href="https://github.com/ssmereka/cramit/wiki/API#find-all-fixtures-and-remove-data" target="_blank">Find All Fixtures and Remove Data</a>
  * <a href="https://github.com/ssmereka/cramit/wiki/API#find-all-fixtures-and-upsert-data" target="_blank">Find All Fixtures and Upsert Data</a>
  * <a href="https://github.com/ssmereka/cramit/wiki/API#fixture-super" target="_blank">Fixture Super</a>
  * <a href="https://github.com/ssmereka/cramit/wiki/API#fixture-prototype" target="_blank">Fixture Prototype</a>
  * <a href="https://github.com/ssmereka/cramit/wiki/API#get-all-fixture-data-object" target="_blank">Get All Fixture Data Object</a>
  * <a href="https://github.com/ssmereka/cramit/wiki/API#insert-fixture-data" target="_blank">Insert Fixture Data</a>
  * <a href="https://github.com/ssmereka/cramit/wiki/API#format-fixtures" target="_blank">Format Fixtures</a>
  * <a href="https://github.com/ssmereka/cramit/wiki/API#remove-fixture-data" target="_blank">Remove Fixture Data</a>
  * <a href="https://github.com/ssmereka/cramit/wiki/API#set-config" target="_blank">Set Config</a>
  * <a href="https://github.com/ssmereka/cramit/wiki/API#upsert-fixture-data" target="_blank">Upsert Fixture Data</a>


# Fixture
Data you want to load into a database is defined in a fixture.  A fixture is a pseudo "child class" that overrides a few methods called by the Cramit library.  The data methods overridden in a fixture, such as <a href="https://github.com/ssmereka/cramit/wiki/Fixture#get-new" target="_blank">getNew()</a> and <a href="https://github.com/ssmereka/cramit/wiki/Fixture#get-all" target="_blank">getAll()</a>, return data objects to be loaded into the database.  Let's look at an example of a user model and fixture.

```javascript
// Filename:  user_model.js
// Description:  The user model defines the how the data is stored in the database.

module.exports = function() {
  var db = require('mongoose');
  var ObjectId = db.Schema.ObjectId;

  var User = new db.Schema({
    activated:   { type: Boolean, default: true },
    email:       { type: String                 },
    name:        { type: String                 }
  });

  var UserSchema = db.model('User', User);
};
```

```javascript
// Filename:  user_fixture.js
// Description:  Defines data and methods for adding or removing data to/from the database.

module.exports = function(cramit, options) {

  function UserFixture() {
    cramit.fixtureSuper(this, 'User');
  }

  UserFixture.prototype = cramit.fixturePrototype();

  // Returns a new user not already in the database.
  UserFixture.prototype.getNew = function() {
    return {
      "_id": "999999999999999999999999",
      "activated": true,
      "email": "kevin@gmail.com",
      "name": "Kevin Mitnick"
    };
  };

  // Returns a list of users to be added/removed from the database.
  UserFixture.prototype.getAll = function() {
    return [
      {
        "_id": "000000000000000000000000",
        "activated": true,
        "email": "charlie@gmail.com",
        "name": "Charlie Kelly"
      },
      {
        "_id": "000000000000000000000001",
        "activated": false,
        "email": "macsmom@gmail.com",
        "name": "Mac's Mom"
      }
    ];
  };

  return new UserFixture();
};
```

## Fixture Methods
When implementing a fixture you may want to override one or more methods.  The following is a list of possible methods.

  * <a href="https://github.com/ssmereka/cramit/wiki/Fixture#compare" target="_blank">Compare</a>
  * <a href="https://github.com/ssmereka/cramit/wiki/Fixture#delete-all" target="_blank">Delete All</a>
  * <a href="https://github.com/ssmereka/cramit/wiki/Fixture#find-by-id" target="_blank">Find By ID</a>
  * <a href="https://github.com/ssmereka/cramit/wiki/Fixture#find-in-dataset-by-id" target="_blank">Find In Dataset By ID</a>
  * <a href="https://github.com/ssmereka/cramit/wiki/Fixture#get-all" target="_blank">Get All</a>
  * <a href="https://github.com/ssmereka/cramit/wiki/Fixture#get-all-and-new" target="_blank">Get All and New</a>
  * <a href="https://github.com/ssmereka/cramit/wiki/Fixture#get-new" target="_blank">Get New</a>
  * <a href="https://github.com/ssmereka/cramit/wiki/Fixture#insert-all" target="_blank">Insert All</a>
  * <a href="https://github.com/ssmereka/cramit/wiki/Fixture#populate-id" target="_blank">Populate ID</a>
  * <a href="https://github.com/ssmereka/cramit/wiki/Fixture#populate-ids" target="_blank">Populate IDs</a>
  * <a href="https://github.com/ssmereka/cramit/wiki/Fixture#populate-id-from-dataset" target="_blank">Populate ID from Dataset</a>
  * <a href="https://github.com/ssmereka/cramit/wiki/Fixture#populate-ids-from-dataset" target="_blank">Populate IDs from Dataset</a>
  * <a href="https://github.com/ssmereka/cramit/wiki/Fixture#upsert-all" target="_blank">Upsert All</a>

The current implementation of these methods can be found <a href="https://github.com/ssmereka/cramit/blob/master/libs/fixtures/index.js" target="_blank">here</a>.


# Config
You can configure Cramit using the <a href="https://github.com/ssmereka/cramit/wiki/API#set-config" target="_blank">setConfig(myConfigObject)</a> method.  Pass along an object with any of the properties you wish to override.  For example:

```javascript
var cramit = require('cramit');
var mongoose = require(mongoose);

cramit.setConfig({
  database: {
    type: 'mongoose',         // Set the type of database and connection.
    instance: mongoose        // Pass along the database connection object.
  }
});
```

The available properties are:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| **crave** | Object |  | Accepts a <a href="https://github.com/ssmereka/crave/blob/master/readme.md#config" target="_blank">Crave configuration object</a> to define how models and fixtures are required. |
| **database** | Object |  | An object containing configuration properties related to the database. |
| **database.connectionUri** | String | ```undefined``` | The URI used to connect to a database.  You may alternately choose to specify the database instance. |
| **database.idAttributeName** | String | ```undefined``` | The key used by all records as the unique identifier.  For example mongoose uses ```_id```. |
| **database.instance** | String | ```undefined``` | The database connection object.  You may alternately choose to specify a connection URI instead. |
| **database.type** | String | ```undefined``` | Defines which database adapter to use.  Available options are: ```mongoose```.|
| **debug** | Boolean | ```false``` | When true, Cramit will display log messages. |
| **error** | Boolean | ```true``` | When true, Cramit will display error log messages. |
| **trace** | Boolean | ```false``` | When true, Cramit will display trace log messages. |


# Debug
Debugging Cramit can be done using the ```debug```, ```trace```, and ```error``` flags that can be toggled on/off using the config.  When enabling these flags additional logging will be enabled allowing you to find issues within Cramit easier.


# Documentation

Further documentation can be found in the <a href="https://github.com/ssmereka/cramit/wiki" target="_blank">wiki</a>.


### <a href="http://www.tldrlegal.com/license/mit-license" target="_blank">MIT License</a>