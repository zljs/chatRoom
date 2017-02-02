module.exports = function ( app ) {
    app.get('/register', function(req, res) {
        res.render('register');
    });
    function genUid() {
            return new Date().getTime() + '' + Math.floor(Math.random() * 899 + 100);
        };
    app.post('/register', function (req, res) {
        var User = global.dbHelper.getModel('user'),
            uname = req.body.uname;
        User.findOne({name: uname}, function (error, doc) {
            if (error) {
                res.sendStatus(500);
                req.session.error = '网络异常错误！';
                console.log(error);
            } else if (doc) {
                req.session.error = '用户名已存在！';
                res.sendStatus(500);
            } else {
                User.create({
                    name: uname,
                    password: req.body.upwd,
                    userid:genUid()
                }, function (error, doc) {
                    if (error) {
                        res.sendStatus(500);
                        console.log(error);
                    } else {
                        req.session.error = '用户名创建成功！';
                        res.sendStatus(200);
                    }
                });
            }
        });
    });
}
