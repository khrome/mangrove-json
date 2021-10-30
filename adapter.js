var request = require('request');
var JSONStream = require('JSONStream');
var fs = require('fs');
var path = require('path');

var Adapter = function(options){
    this.root = options.root || 'data/'
    this.filetype = options.filetype===undefined?'json':options.filetype;
    //this.split = options.split || false;
    //this.size = options.size || 500;
}
var JSONStreamBuild = function(stream, handler, cb){
  var jsonStream = stream.pipe(JSONStream.parse('*'));
  jsonStream.on('data', function(data){
      handler(data);
  });
  jsonStream.on('close', function(data){
      cb();
  });
  return jsonStream;
}

Adapter.prototype.load = function(name, options, handler, cb){
    var stream;
    var url = path.join(this.root, name+(this.filetype?'.'+this.filetype:''));
    if(url.indexOf('://') !== -1){
        stream = request({url: url});
        JSONStreamBuild(stream, handler, cb);
    }else{
        fs.access(url, (err) => {
          if(err) fs.writeFileSync(url, '[]');
          stream = fs.createReadStream(url);
          JSONStreamBuild(stream, handler, cb);
        });
    }
}

Adapter.prototype.loadCollection = function(collection, name, options, cb){
    this.load(name, options, function(item){
      collection.index[item[collection.primaryKey]] = item;
    }, cb);
}

module.exports = {
  Adapter : Adapter
}
