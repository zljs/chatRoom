var express = require('express');
var app = express();
var path = require('path');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var http = require('http').Server(app);
var io = require('socket.io')(http);

global.dbHelper = require('./dao/dbHelper');
global.db = mongoose.connect("mongodb://127.0.0.1:27017/ChatUser");

app.use(session({
    secret: 'secret',
    cookie: {
        maxAge: 1000 * 60 * 30
    }
}));

app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'html');
app.engine('.html', require('ejs').__express);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
    res.locals.user = req.session.user;
    var err = req.session.error;
    res.locals.message = '';

    if (err) {
        res.locals.message = '<div class="alert alert-danger" style="margin-bottom: 20px;color:red;">' + err + '</div>';
    } else {}
    next();
});


require('./routes')(app);
app.get('/', function(req, res) {
    res.render('login');
});

var User = global.dbHelper.getModel('user');
var userServer = {};
var freeList = [];
// 在线用户
var onlineUsers = {};
// 当前在线人数
var onlineCount = 0;

io.on('connection', function(socket) {
    console.log('新用户已上线！')

    /*    socket.on('login', function(obj) {
            User.findOne({ name: obj.username }, function(err, self) {
                // 将新加入用户的唯一标识当作socket的名称
                socket.name = self.userid;
                if (!onlineUsers.hasOwnProperty(self.userid)) {
                    onlineUsers[self.userid] = self.name;

                    //在线人数+1
                    onlineCount++;
                }
                // 向所有客户端广播用户加入
                io.emit('login', {
                    onlineUsers: onlineUsers,
                    onlineCount: onlineCount,
                    user: self.name
                });
                console.log(self.name + '加入聊天室');
            })
        })

        //监听用户退出
        socket.on('disconnect', function() {
            //将退出的用户从在线列表中删除
            if (onlineUsers.hasOwnProperty(socket.name)) {
                // 退出用户的信息
                var obj = {
                    userid: socket.name,
                    username: onlineUsers[socket.name]
                }

                // 删除
                delete onlineUsers[socket.name]
                onlineCount--;
                io.emit('logout', {
                    onlineUsers: onlineUsers,
                    onlineCount: onlineCount,
                    user: obj
                });
                console.log(obj.username + '退出了聊天室');
            }
        })*/

    //监听单独连线
    socket.on('newRoom', function(obj) {
            console.log(obj)

            User.findOne({ name: obj.from }, function(error, from) {
                User.findOne({ name: obj.to }, function(error, to) {
                    var listRoom = {
                        'fromName': from.name,
                        'fromId': from.userid,
                        'toName': to.name,
                        'targetId': to.userid,
                    }
                    socket.id = from.userid;
                    userServer[from.userid] = socket;
                    listRoom[from.userid] = from.name;

                    freeList.push(from.userid)
                        // io.emit('onlineCount', freeList)
                        // io.emit('addCount', count)
                    if (freeList.length > 1) {
                        var fromuser = from.userid;
                        Arrayremove(freeList, fromuser)
                        if (freeList.length == 1) {
                            n = 0
                        } else {
                            n = Math.floor(Math.random() * freeList.length)
                        }
                        var touser = freeList[n];
                        Arrayremove(freeList, touser);
                        // io.emit('getChat', { p1: fromuser, p2: touser }, listRoom);

                    }
                })
            })
        })
        // 监听消息收发
    socket.on('getMsg', function(obj) {
        console.log(obj.flag)
        User.findOne({ name: obj.from }, function(error, from) {
            User.findOne({ name: obj.to }, function(error, to) {
                var newObj = {
                    'content': obj.content,
                    'fromName': obj.from,
                    'flag':obj.flag
                }
                if (userServer.hasOwnProperty(from.userid)) {
                    userServer[from.userid].emit('getMsg', newObj);
                    console.log(obj.from + '说：' + obj.content);
                    // console.log(userServer)
                } else {
                    socket.emit("err", { msg: "对方已经下线或者断开连接" })
                }
                if (to.userid) {
                    if (userServer.hasOwnProperty(to.userid)) {
                        userServer[to.userid].emit('getMsg', newObj);
                        console.log(obj.to + '说：' + obj.content);
                        // console.log(userServer)
                    } else {
                        // console.log(err)

                        socket.emit("err", { msg: "对方已经下线或者断开连接" })
                    }
                };
            })

        })
    })

    /*    // 服务器时间同步
        function tick() {
            var now = new Date().toUTCString();
            // console.log(now);
            io.emit('time', now);
        }
        setInterval(tick, 1000);*/
})

function Arrayremove(array, name) {
    var len = array.length;
    for (var i = 0; i < len; i++) {
        if (array[i] == name) {
            array.splice(i, 1)
            break
        }
    }
}
http.listen(1100, function() {
    console.log('The server is starting on port 1100.')
});
