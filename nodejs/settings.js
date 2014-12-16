module.exports = {
	http: {
		ip: '0.0.0.0',
		port: 88
	},
	mongodb: {
		host: 'localhost',
		port: 27017,
		db: 'hehe',
		user: null,
		password: null
	},
	session: {
		collection: 'session',
		key: 'hehe.sid',
		secret: 'powered by hehe',
		max_age: 1000 * 60 * 60 * 24 * 30
	},
	user: {
		anonymous_nickname: 'Heher'
	},
	admin: {
		password: 'heheadmin'
	}
}