var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var connectionSchema = new Schema({
	url_id: Schema.Types.ObjectId,
	user_id: Schema.Types.ObjectId,
	socket_id: String,
	connect_times: Number,
	date_time: {
		start: Date,
		end: Date,
		last: Number
	}
}, {
	versionKey: false
});

var Connection = mongoose.model('Connection', connectionSchema);

module.exports = Connection;