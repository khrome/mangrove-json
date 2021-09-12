var request = require('request');
var JSONStream = require('JSONStream');
var fs = require('fs');
//var es = require('event-stream');

var Adapter = function(options){
    this.root = options.root || 'data/'
    this.filetype = options.filetype===undefined?'json':options.filetype;
    //this.split = options.split || false;
    //this.size = options.size || 500;
}

Adapter.prototype.load = function(name, options, handler, cb){
    var stream;
    var url = this.root+name+(this.filetype?'.'+this.filetype:'');
    if(url.indexOf('://') !== -1){
        stream = request({url: url})
    }else{
        stream = fs.createReadStream(url);
    }
    var jsonStream = stream.pipe(JSONStream.parse('*'));
    jsonStream.on('data', function(data){
        handler(data);
    });
    //jsonStream.on('header', function(data){ });
    jsonStream.on('close', function(data){
        cb();
    });
}

Adapter.prototype.loadCollection = function(collection, name, options, cb){
    this.load(name, options, function(item){
      collection.index[item[collection.primaryKey]] = item;
    }, cb);
}

module.exports = {
  Adapter : Adapter
}
