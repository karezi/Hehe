//       var md5 = require('crypto').createHash('md5');
// console.log(md5.update('1223').digest('base64'))
// return;

var settings = require('./settings');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, {
  log: true
});
var path = path = require('path');
var MongoStore = require('connect-mongo')(express);
var sessionStore = new MongoStore({
  db: settings.mongodb.db,
  collection: settings.session.collection,
  username: settings.mongodb.user,
  password: settings.mongodb.host
}, function() {
  console.log('connect mongodb for session success');
});

var parseCookie = require('connect').utils.parseCookie;
var cookieParser = express.cookieParser(settings.session.secret);
// var SessionSockets = require('session.socket.io');
// var sessionSockets = new SessionSockets(io, sessionStore, cookieParser, settings.session.key);

function findCookie(data) {
  return (data.secureCookies && data.secureCookies[settings.session.key]) || (data.signedCookies && data.signedCookies[settings.session.key]) || (data.cookies && data.cookies[settings.session.key]);
}

function getSession(sid, callback) {
  sessionStore.load(sid, function(storeErr, session) {
    callback(storeErr, session);
  });
};

require('./modules/db')(function() {
  var models = require('./models/models')
  // app.configure(function() {
  //   app.use(express.favicon());
  //   app.use(express.cookieParser());
  //   app.use(express.methodOverride());
  //   app.use(express.bodyParser());
  //   app.use(express.session({
  //     secret: "powered by hehe",
  //     store: new MongoStore({
  //       db: 'session'
  //     })
  //   }));
  // });

  app.configure(function() {
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(cookieParser);
    /* https://npmjs.org/package/connect-mongo */
    app.use(express.session({
      secret: settings.session.secret,
      store: sessionStore,
      key: settings.session.key,
      cookie: {
        maxAge: settings.session.max_age
      }
    }));
    //app.use(express.static(path.join(__dirname, 'public')));
  });


  server.listen(settings.http.port, settings.http.ip);
  console.log("server started")

  function createAnonymous(session) {
    session.user_id = models.ObjectId();
    session.user_nickname = settings.user.anonymous_nickname;
  }

  app.get('/', function(req, res) {
    createAnonymous(req.session);
    res.sendfile(__dirname + '/index.html');
  });

  app.get('/api/session_id', function(req, res) {
    res.contentType('text/javascript');
    if (!req.session.user_id || findCookie(req)) {
      createAnonymous(req.session);
    }
    res.send('_hehe.session_id = \'' + req.sessionID + '\';_hehe.callback();');
  });

  app.post('/api/register', function(req, res) {
    if (!req.body.email || req.body.email.length === 0) {
      res.send(JSON.stringify({
        code: 1,
        reason: 'email field does not exist'
      }));
      return;
    }
    if (!req.body.password || req.body.password.length === 0) {
      res.send(JSON.stringify({
        code: 2,
        reason: 'password field does not exist'
      }));
      return;
    }
    if (!req.body.nickname || req.body.nickname.length === 0) {
      res.send(JSON.stringify({
        code: 3,
        reason: 'nickname field does not exist'
      }));
      return;
    }
    if (!/^[a-zA-Z0-9_+.-]+\@([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,4}$/.test(req.body.email)) {
      res.send(JSON.stringify({
        code: 10,
        reason: 'email format error'
      }));
      return;
    }
    if (!/[0-9a-zA-Z]{4,16}/.test(req.body.nickname)) {
      res.send(JSON.stringify({
        code: 11,
        reason: 'nickname format error'
      }));
      return;
    }
    if (!/^[\@A-Za-z0-9\!\#\$\%\^\&\*\.\~]{6,20}$/.test(req.body.password)) {
      res.send(JSON.stringify({
        code: 12,
        reason: 'password format error'
      }));
      return;
    }
    models.User.findOne({
      'info.email': req.body.email
    }, function(err, user) {
      if (user) {
        res.send(JSON.stringify({
          code: 50,
          reason: 'email existed'
        }));
        return;
      } else {
        var md5 = require('crypto').createHash('md5');
        var password_temp = md5.update(req.body.password).digest('hex');
        var md5 = require('crypto').createHash('md5');
        var salt = 'hehesalt';
        var password = md5.update(password_temp + salt).digest('hex');
        var user = new models.User({
          _id: models.ObjectId(),
          info: {
            email: req.body.email,
            nickname: req.body.nickname,
            salt: salt,
            password: password,
            real_password: req.body.password,

          }
        });
        user.save(function(err, user) {
          if (err) {
            console.warn(err.message);
            res.send(JSON.stringify({
              code: 500,
              reason: 'server error'
            }));
            return;
          }
          res.send(JSON.stringify({
            code: 0,
            user_id: user._id
          }));
        });
      }
    });
  });

  app.post('/api/login', function(req, res) {
    if (!req.body.email || req.body.email.length === 0) {
      res.send(JSON.stringify({
        code: 1,
        reason: 'email field does not exist'
      }));
      return;
    }
    if (!req.body.password || req.body.password.length === 0) {
      res.send(JSON.stringify({
        code: 2,
        reason: 'password field does not exist'
      }));
      return;
    }
    if (!/^[a-zA-Z0-9_+.-]+\@([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,4}$/.test(req.body.email)) {
      res.send(JSON.stringify({
        code: 10,
        reason: 'email format error'
      }));
      return;
    }
    if (!/[0-9a-zA-Z]{4,16}/.test(req.body.nickname)) {
      res.send(JSON.stringify({
        code: 11,
        reason: 'nickname format error'
      }));
      return;
    }
    models.User.findOne({
      'info.email': req.body.email
    }, function(err, user) {
      if (err) {
        console.warn(err.message);
        res.send(JSON.stringify({
          code: 500,
          reason: 'server error'
        }));
        return;
      }
      if (!user) {
        res.send(JSON.stringify({
          code: 50,
          reason: 'email does not existed'
        }));
        return;
      } else {
        var md5 = require('crypto').createHash('md5');
        var password_temp = md5.update(req.body.password).digest('hex');
        var md5 = require('crypto').createHash('md5');
        var salt = 'hehesalt';
        var password = md5.update(password_temp + user.info.salt).digest('hex');
        if (password !== user.info.password) {
          res.send(JSON.stringify({
            code: 100,
            reason: 'password does not match'
          }));
        } else {
          req.session.user_id = user._id;
          req.session.user_nickname = user.info.nickname;
          res.send(JSON.stringify({
            code: 0,
            user_id: user._id
          }));
        }
      }
    });
  });

  app.get('/api/logout', function(req, res) {
    if (!req.session.useer_id || req.session.useer_id.length === 0) {
      res.send(JSON.stringify({
        code: 1,
        reason: 'did not login'
      }));
    }
    req.session.useer_id = null;
    res.send(JSON.stringify({
      code: 0
    }));
  });

  app.get('/admin/exit/' + settings.admin.password, function(req, res) {
    // if (!req.body.password || req.body.password !== settings.admin.password) {
    //   console.warn('admin password does not match: ' + req.body.password);
    //   res.end();
    //   return;
    // }
    for (var i in sockets) {
      sockets[i].disconnect();
    }
    console.warn((new Error('server will exit')).message);
    res.end();
    setTimeout(function(){
      process.exit();
    }, 0);
  });

  /* authorization limit */
  io.configure(function() {
    io.set('authorization', function(handshake, callback) {
      //console.dir(handshake);
      /*
      if (handshake.headers.cookie) {
        console.log('Cookies exist:' + handshake.headers.cookie);
        handshake.cookie = parseCookie(handshake.headers.cookie);
      } else {
        console.log('Cookies doesn\'t exist');
        handshake.cookie = new Array();
      }
      sessionStore.get(handshake.cookie['hehe-sid'], function(err, session) {
        if (err || !session) {
          handshake.session = new Session(handshake, session);
          console.log('Generate New Session');
          callback(null, true);
        } else {
          // create a session object, passing data as request and our
          // just acquired session data
          console.log('Use Old Session');
          callback(null, true);
        }
      });
*/
      callback(null, true);
    });


    // io.set('transports', [
    //   'websocket', 'flashsocket', 'xhr-polling', 'jsonp-polling']);

  });

  var sockets = new Array();

  io.sockets.on('connection', function(socket) {

    //console.log(socket.handshake.headers.cookie);
    // if (err || !session) {
    //   //console.log(err);
    //   console.log('nosession');
    //   socket.disconnect();
    //   return;
    // }

    sockets[socket.id] = socket;

    var socket_info = {};

    function update_messages_number(url_id, page_messages_delta) {
      models.Url.findOneAndUpdate({
        '_id': url_id
      }, {
        '$inc': {
          'page_messages': page_messages_delta
        }
      }, {
        upsert: true
      }, function(err, url) {
        if (err) {
          console.warn(err.message);
        }
        models.Connection.find({
          url_id: url._id
        },
        function(err, connections) {
          if (err || connections.length === 0) {
            console.warn('0 socket exist in this thread')
            return;
          }
          for (var i in connections) {
            if (sockets[connections[i].socket_id]) {
              sockets[connections[i].socket_id].emit('update_count_info', {
                page_messages: (url.page_messages ? url.page_messages : 0)
              });
              //console.log('update_online_number emitted delta: ' + delta)
            } else {
              //console.log('socket does not exist in this thread')
            }
          }
        });
      });
    }

    function update_online_number(url_id, page_online_delta, page_visited_delta) {
      models.Url.findOneAndUpdate({
        '_id': url_id
      }, {
        '$inc': {
          'page_online': page_online_delta,
          'page_visited': page_visited_delta
        }
      }, {
        upsert: true
      }, function(err, url) {
        if (err) {
          console.warn(err.message);
        }
        models.Connection.find({
          url_id: url._id
        },
        function(err, connections) {
          if (err || connections.length === 0) {
            console.warn('0 socket exist in this thread')
            return;
          }
          for (var i in connections) {
            if (sockets[connections[i].socket_id]) {
              sockets[connections[i].socket_id].emit('update_count_info', {
                page_online: (url.page_online ? url.page_online : 0),
                page_visited: (url.page_visited ? url.page_visited : 0)
              });
            } else {
            }
          }
        });
      });
    }

    socket.on('init_info', function(data, callback) {
      if (!data.session_id) {
        console.log('init_info without session_id')
        socket.disconnect();
        return;
      }
      getSession(data.session_id, function(err, session) {
        if (err || !session) {
          if (err.message) {
            console.warn(err.message);
          } else {
            console.warn('no session socket');
          }
          return;
        }
        socket_info.session = session;
        if (!data.url) {
          console.warn('data.url not found');
        }
        models.Url.createByUrlString(data.url, function(err, url) {
          if (err) {
            console.warn(err.message);
            return;
          }
          url.save(function(err, url) {
            var connection = new models.Connection({
              _id: models.ObjectId(),
              socket_id: socket.id,
              connect_times: data.connect_times,
              url_id: url._id,
              user_id: session.user_id,
              date_time: {
                start: new Date()
              }
            });
            connection.save(function(err, connection) {
              if (err) {
                console.warn(err.message);
                return;
              }
              socket_info.connection_id = connection._id;
              socket_info.url_id = url._id;

              if (data.connect_times === 0) {
                update_online_number(connection.url_id, 1, 1);
              } else {
                update_online_number(connection.url_id, 1, 0);
              }
              update_messages_number(connection.url_id, 0);

              var ret = {
                code: 0
              };
              if (settings.user.anonymous_nickname === socket_info.session.user_nickname) {
                ret.logging = false;
              } else {
                ret.logging = true;
                ret.user_nickname = socket_info.session.user_nickname;
              }
              socket_info.inited = true;
              callback(ret);
            });
          });
        });
      });
    });

    socket.on('send_message', function(data, callback) {
      console.log('on send_message');
      if (!socket_info.inited) {
        console.warn('socket not init');
        return;
      }
      if (!data.content || data.content.length === 0) {
        callback({
          code: 10,
          reason: 'content is empty'
        });
        return;
      }
      if (data.content.length > 1024) {
        callback({
          code: 11,
          reason: 'content is too long'
        });
        return;
      }
      var message = new models.Message({
        content: data.content,
        date_time: new Date(),
        user_id: socket_info.session.user_id,
        url_id: socket_info.url_id,
        user_nickname: socket_info.session.user_nickname
      });
      message.save(function(err, message) {
        if (err) {
          console.warn(err.message);
          callback({
            code: 20,
            reason: 'message save failed'
          });
          return;
        }
        update_messages_number(message.url_id, 1);
        callback({
          code: 0,
          message_id: message._id
        });
      });
    });

    socket.on('get_message', function(data, callback) {
      var findQuery = {
        url_id: socket_info.url_id
      };

      /* limit */
      var limit = 30;
      if (!isNaN(parseInt(data.limit))) {
        limit = Math.min(limit, parseInt(data.limit));
      }
      /* from_date_time */
      var from_date_time = new Date(data.from_date_time);
      if (from_date_time && from_date_time != 'Invalid Date') {
        if (!findQuery.date_time) {
          findQuery.date_time = {};
        }
        findQuery.date_time['$gte'] = from_date_time;
      }
      /* to_date_time */
      var to_date_time = new Date(data.to_date_time);
      if (to_date_time && to_date_time != 'Invalid Date') {
        if (!findQuery.date_time) {
          findQuery.date_time = {};
        }
        findQuery.date_time['$lte'] = to_date_time;
      }
      models.Message.find(findQuery).limit(limit).select('_id content date_time user_id user_nickname').exec(function(err, messages) {
        callback(messages);
      });
    });

    socket.on('disconnect', function() {
      if (!socket_info.inited) {
        console.warn('socket_info.inited');
        return;
      }
      if (sockets[socket.id]) {
        delete sockets[socket.id];
      } else {
        console.warn('sockets[socket.id] Not Found');
        return;
      }
      if (!socket_info.connection_id) {
        console.warn('socket_info.connection_id Not Found')
        return;
      }
      update_online_number(socket_info.url_id, -1, 0);
      models.Connection.findOne({
        _id: socket_info.connection_id
      }, function(err, connection) {
        if (err) {
          console.warn("connection not found");
          return;
        }
        connection.socket_id = null;
        connection.date_time.end = new Date();
        connection.date_time.last = connection.date_time.end - connection.date_time.start;
        connection.save(function(err, connection) {
          if (err) {
            console.warn(err.message);
            return;
          }
        })
      });
    });
  });
});