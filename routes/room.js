module.exports = function(app,io) {
    app.get('/room', function(req, res) {
        console.log(req.session.user);
        if (req.session.user) {
            var olduser = global.dbHelper.getModel('user');
            olduser.find({}, function(error, docs) {
                var self = req.session.user;
                var userInfo = {
                    selfName : self.name ,
                    nameList : docs
                }
                // res.send(userInfo);
                res.render('room', { Users: userInfo});
            });

        } else {
            req.session.error = "请先登录"
            res.redirect('/login');
        };

    });

}
