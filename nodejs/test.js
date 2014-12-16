require('./modules/db')(function(err) {

	if (err) {
		console.log(err.message);
	}

	var models = require('./models/models');

	// var user = new models.User({
	// 	info: {
	// 		email: 'malash@qq.com'
	// 	}
	// });
	// user.save();

	models.User.findOne({
		info: {
			email: 'malash1@qq.com'
		}
	}, function(err, user) {
		console.log(err);
		console.log(user);
	})
});
