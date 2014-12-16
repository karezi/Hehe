var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	info: {
		email: String,
		nickname: String,
		salt: String,
		password: String,
		real_password: String
	}
}, {
	versionKey: false
});

var User = mongoose.model('User', userSchema);

module.exports = User;