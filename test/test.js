var should = require("chai").should();
var Indexed = require('indexed-set');
var MangroveJSON = require('../adapter');
//var datasource = new Mangrove({});

describe('Mangrove JSON Adapter', function(){

    describe('works independently', function(){

          it('loads a JSON file', function(done){
              var adapter = new MangroveJSON.Adapter({root: './test/data/'});
              var loaded = [];
              adapter.load('beatles', {}, function(item){
                  loaded.push(item)
              }, function(){
                  loaded.length.should.equal(4);
                  done();
              })
          });

          it('loads a JSON file into a collection', function(done){
              var adapter = new MangroveJSON.Adapter({root: './test/data/'});
              var loaded = new Indexed.Collection([], 'id');
              adapter.loadCollection(loaded, 'beatles', {}, function(){
                  var set = new Indexed.Set(loaded, 'id');
                  set.length.should.equal(4);
                  done();
              });
          });
    });
});
