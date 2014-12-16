/*
var mongodb = require('mongodb');
var server = new mongodb.Server('localhost', 27017, {
  auto_reconnect: true
});
var db = new mongodb.Db('mydb', server, {
  safe: true
});
db.open(function(err, db) {
  if (!err) {
    db.collection('mycoll', {
      safe: true
    }, function(err, collection) {
      var tmp1 = {
        title: 'hello',
        number: 1
      };
      collection.insert(tmp1, {
        safe: true
      }, function(err, result) {
        console.log(result);
      });　　　　
    });
  } else {
    console.log(err);
  }

});

*/
MongoClient = require('mongodb').MongoClient;

MongoClient.connect("mongodb://localhost:27017/hehe", function(err, db) {
  if(err) throw err;

  console.log("connected");

  var collection = db.collection('test');
  var docs = [{mykey:1}, {mykey:2}, {mykey:3}];

  collection.insert(docs, {w:1}, function(err, result) {
    collection.find().toArray(function(err, items) {});

      var stream = collection.find({mykey:{$ne:2}}).stream();

      stream.on("data", function(item) {
          console.log("MongoDB Item: ");
          console.log(item);
      });

      stream.on("end", function() {});

      collection.findOne({mykey:1}, function(err, item) {});
  });  
})


