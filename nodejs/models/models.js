module.exports = {
	ObjectId: function() {
		return new require('mongoose').Types.ObjectId();
	},
	Url: require('./url'),
	Connection: require('./connection'),
	User: require('./user'),
	Message: require('./message')
}