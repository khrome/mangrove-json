var request = require('postman-reques');
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

Adapter.prototype.saveCollection = function(collection, name, options, cb){
    var lcv = 0;
    var list;
    this.save(name, options, function(){
        if(!list) list = Object.keys(collection.index);
        return list.length?collection.index[list.shift()]:null;
    }, cb);
}

Adapter.prototype.save = function(name, options, next, cb){
    var url = path.join(this.root, name+(this.filetype?'.'+this.filetype:''));
    var backUrl = path.join(this.root, name+'.bak'+(this.filetype?'.'+this.filetype:''));
    fs.rename(url, backUrl, function(err){
        //todo: handle errors by reverting
        var writtenOne = false;
        var writeChain = function(callback){
            var item = next();
            if(item){
                var writable = (writtenOne?",\n":"\n")+JSON.stringify(item)
                fs.appendFile(url, writable, function(err){
                    if(!writtenOne) writtenOne = true;
                    writeChain(callback);
                });
            }else{
                callback()
            }
        }
        fs.writeFile(url, '['+"\n", function(err){
            writeChain(function(){
                fs.appendFile(url, ']', function(err){
                    //TODO: some kind of optional validation
                    fs.unlink(backUrl, function(){
                        cb();
                    });
                });
            })
        });

    });
}

module.exports = {
  Adapter : Adapter
}
