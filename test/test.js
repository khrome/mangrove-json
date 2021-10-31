var should = require("chai").should();
var Indexed = require('indexed-set');
var MangroveJSON = require('../adapter');
var fs = require('fs');
var path = require('path');
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

          it('saves a collection into a JSON file', function(done){
              var adapter = new MangroveJSON.Adapter({root: './test/data/'});
              var data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'beatles.json')));
              var loaded = new Indexed.Collection(data, 'id');
              adapter.saveCollection(loaded, 'justatest', {}, function(){
                  var location = path.join(__dirname, 'data', 'justatest.json');
                   var newData = JSON.parse(fs.readFileSync(location));
                   Object.keys(newData).should.deep.equal(Object.keys(data));
                   Object.keys(newData).forEach(function(key){
                       data[key].should.deep.equal(newData[key]);
                   });
                   //test
                   fs.unlink(location, function(){
                       done();
                   });
              });
          });
    });
});
