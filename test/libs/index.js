
/* ************************************************** *
 * ******************** Private Variables
 * ************************************************** */

var assert = require("assert"),
    Cramit = require('../../libs/index.js')
    cramit = Cramit(),
    fs = require("fs"),
    path = require("path"),
    should = require("should"),
    _ = require("lodash");

var UserFixture = require('../data/user_fixture.js'),
  UserModel = require('../data/user_model.js');


/* ************************************************** *
 * ******************** Private Methods
 * ************************************************** */


/* ************************************************** *
 * ******************** Test Suite
 * ************************************************** */

describe('Cramit', function() {

  beforeEach(function(done) {
    cramit.setConfig()
    cramit.setLog()
    cramit.setError()
    done();
  });

  describe('Fixture', function() {
      
    it('', function(done) {
      
      done();
    });

  });

  describe('Load', function() {
      
    it('', function(done) {

      done();
    });

  });

});