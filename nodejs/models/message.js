var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var messageSchema = new Schema({
	content: String,
	date_time: Date,
	user_id: Schema.Types.ObjectId,
	url_id: Schema.Types.ObjectId,
	user_nickname: String
}, {
	versionKey: false
});

var Message = mongoose.model('Message', messageSchema);

module.exports = Message;