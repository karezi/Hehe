module.exports = function(callback) {
	var settings = require('../settings');
	var mongodb = require('mongodb');
	var mongoUri = "mongodb://" + settings.mongodb.host + ":" + settings.mongodb.port + "/" + settings.mongodb.db;

	var mongoose = require('mongoose');
	mongoose.connect(mongoUri);
	var db = mongoose.connection;
	db.on('error', function(err) {
		callback(err);
	});
	db.once('open', function() {
		callback();
	});
};


// var db = null;
// module.exports = function(callback) {
// 	if (!db) {
// 		var settings = require('../settings');
// 		var mongodb = require('mongodb');
// 		var mongoUri = "mongodb://" + settings.mongodb.host + ":" + settings.mongodb.port + "/" + settings.mongodb.db;
// 		mongodb.MongoClient.connect(mongoUri, function(err, database) {
// 			if (err) {
// 				throw "connect to mongodb error: " + err.message;
// 			}
// 			console.log('mongodb connected');
// 			db = {
// 				ObjectID: mongodb.ObjectID,
// 				connection: database.collection('connection'),
// 				user: database.collection('user'),
// 				url: database.collection('url'),
// 				message: database.collection('message'),
// 				share: database.collection('share'),
// 				share_method: database.collection('share_method')
// 			}
// 			callback(db);
// 		});
// 	} else {
// 		console.dir(db);
// 		console.log('use old db');
// 		callback(db);
// 	}
// }