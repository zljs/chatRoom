module.exports = function(app) {
    var multer = require('multer');
    var upload = multer({
        dest: 'public/images/'
    });
    app.get('/upload', function(req, res) {
        if (req.session.user) {
            res.render('upload');
        } else {
            req.session.error = "请先登录"
            res.render('login');
        }
    });
    app.post('/upload', upload.array('file', 2), function(req, res, next) {
        if (req.session.user) {
          console.log(req.body);
            var Picture = global.dbHelper.getModel('picture');
            try {
                for (var i = 0; i < req.files.length; i++) {
                    Picture.create({
                        name: req.files[i].originalname,
                        description: req.body.desc,
                        imgSrc: req.files[i].filename
                    });
                }
                res.sendStatus(200);
            } catch (e) {
                res.sendStatus(404);
            }
        } else {
            req.session.error = "请先登录"
            res.render('login');
        }
    });
}
