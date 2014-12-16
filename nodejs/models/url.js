var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var urlSchema = new Schema({
	hostname: String,
	port: Number,
	path: String,
	page_visited: Number,
	page_online: Number,
	page_messages: Number
}, {
	versionKey: false
});


urlSchema.statics.createByUrlString = function(url_str, callback) {
	var url_parse = require('url').parse(url_str);

	if (!url_parse.host || !url_parse.port || !url_parse.path) {
		var err = new Error('url: ' + url_str + ' parse error');
		callback(err);
	}
	url_parse.port = parseInt(url_parse.port);
	url_parse.port = url_parse.port ? url_parse.port : 80;
	url_parse.host = url_parse.hostname + ':' + url_parse.host;
	url_parse.hash = (url_parse.hash === '#') ? '' : url_parse.hash;
	url_parse.search = (url_parse.search === '?') ? '' : url_parse.search;
	url_parse.href = '';
	url_parse.href += url_parse.protocol;
	url_parse.href += url_parse.host;
	url_parse.href += url_parse.path;
	url_parse.href += url_parse.hash;
	Url.findOne({
		hostname: url_parse.hostname,
		port: url_parse.port,
		path: url_parse.path
	}, function(err, url) {
		if (err) {
			callback(err);
			return;
		}
		if (url) {
			callback(null, url);
		} else {
			callback(null, new Url({
				hostname: url_parse.hostname,
				port: url_parse.port,
				path: url_parse.path
			}));
		}
	});
}

var Url = mongoose.model('Url', urlSchema);

module.exports = Url;