$(document).ready(function() {
    var fullPageBtn = $('button.btn');

    var self = $("#showselfname")[0].innerText.trim();
    // console.log(self)

    var socket = io.connect();
    socket.emit('login', {
        'username': self
    })

    function upArr(array) {
        for (let i in array) {
            for (let j in array) {
                if (i != j) {
                    if (array[i] == array[j]) {
                        array.splice(i, 1);
                        break;
                    }
                };
            }
        }
    }
    // 监听用户登录

    var now_chat_list = [];
    $('li').on('dblclick', function() {
        /* socket.on('login', function(o) {
             console.log(o);
         });*/

        if ($(".chat").hide) {
            $(".chat").show();
        };

        var touser = $(this).children('.userlist_name')[0].innerText;
        socket.emit('newRoom', {
            'from': self,
            'to': touser
        })
        $("#touser").html(touser);
        $("#showMsg").html('');

        now_chat_list.push(touser);

        upArr(now_chat_list);

        if (now_chat_list.length > 5) {
            now_chat_list.splice(0, 1);
        };
        // console.log(now_chat_list);
        var msg = '';
        $("#send").on('click', function() {
                msg = $("#msg").val();
                send_msg(msg);

            })
            // 点击后发送图片，隐藏预览
        $("#sendImg").on('click', function() {
            msg = $("#preview").attr("src");
            $("#previewBox").hide();
            // console.log(msg)

            send_img(msg);

        })
        $("#msg").on('keydown', function(e) {
            msg = $("#msg").val();

            if (e.keyCode === 13) {
                e.preventDefault();
                send_msg(msg)
            };
        })
    });

    function send_img(src) {
        if (src != '') {

            socket.emit('getMsg', {
                'flag': 'img',
                'from': self,
                'content': src,
                'to': $("#touser").text()
            })
        };
    }

    function send_msg(msg) {
        if (msg.trim() != '') {

            socket.emit('getMsg', {
                'flag': 'word',
                'from': self,
                'content': msg,
                to: $("#touser").text()
            })
        };
        $("#msg").val('').blur();
    }

    function replace_em(str) { // 匹配表情字符
        str = str.replace(/\</g, '&lt;');
        str = str.replace(/\>/g, '&gt;');
        str = str.replace(/\n/g, '<br/>');
        str = str.replace(/\[em_([0-9]*)\]/g, '<img src="images/face/$1.gif" border="0" />');
        return str;
    }
    $('#emotion').qqFace({ //表情转换
        'id': 'facebox', //表情盒子的ID
        'assign': 'msg', //给那个控件赋值
        'path': 'images/face/' //表情存放的路径
    });
    $("#msg").blur(function() {
        $("#facebox").css("display", "none");
    })


    $(".back").on('click', function() {
        now_chat_list.pop();
        $("#touser").html(now_chat_list[now_chat_list.length - 1]);
        if (now_chat_list.length == 0) {
            $(".chat").hide();
        };
        // console.log(now_chat_list);


    });
    // socket.on('getChat', function(data, listRoom) { //如果广播到用户包含自己，则匹配聊天
    //         console.log(data)
    //     })
    /*$("#send").on('click', function() {
        var msg = $("#msg").val();
        socket.emit('getMsg', {
            from: self,
            content: msg,
            to: $("#touser").text()
        })
    })*/
    socket.on('getMsg', function(newObj) {
            console.log(newObj)
            var isW = (newObj.flag === 'word') ? true : false;

            var newContent = replace_em(newObj.content);
            var isme = (newObj.fromName === self) ? true : false;
            var isto = (newObj.fromName === $("#touser").text()) ? true : false;
            var contentDiv = '';
            if (isW) {
                contentDiv = '<div>' + newContent + '</div>';
            } else {
                contentDiv = '<div>' + '<img class="check" src="' + newContent + '"/>' + '</div>'
            };
            var usernameDiv = '';
            var section = $('<section class="clearfix"></section>');
            if (isme) {
                usernameDiv = '<span>' + newObj.fromName + '</span>';
                section.addClass('user');
                section.html(contentDiv + usernameDiv);
            } else {
                if (!isto) {
                    if ($(".chat").hide) {
                        $(".chat").show();
                    };
                    $("#touser").html(newObj.fromName);
                    $("#showMsg").html('');
                };
                usernameDiv = '<span>' + newObj.fromName + '</span>';
                section.addClass('service');
                section.html(usernameDiv + contentDiv);
            };
            $("#showMsg").append(section)
            scrollBottom();
        })
        //退出登录
    $("#logout").on('click', function() {
        location.href = 'login';
        socket.disconnect();

    })

    function scrollBottom() { // 接收新消息时，聊天框自动滚到最下方
        var h = $("#showMsg")[0].scrollHeight
        $("#showMsg").scrollTop(h)
    }
    var winH = $(".container").innerHeight();
    $("#img").on('click', function() {
            $("#photo").trigger('click');
        })
        // 选择图片并预览
    $("#photo").on('change', function() {
            var reader = new FileReader();
            reader.onload = function(e) {
                $("#preview").attr("src", this.result);
                $("#preview").css("width", winH + 'px');
                $("#previewBox").hide().stop().fadeIn();
                $("#preview").on('click', function() {
                    $("#previewBox").hide();
                })
                fullPageBtn[0].addEventListener('click', function() {
                    fullPage('#preview');

                });
            }
            reader.readAsDataURL(this.files[0])

        })


    // 点击发送后的图片查看
    $("body").delegate('.check', 'click', function() {
            var img = $(this).attr("src");
            // console.log(img)
            $("#check").attr("src", img);
            $("#check").css("width", winH + 'px');
            $("#scan").show();
            $("#check").click(function() {
                $("#scan").hide();
            })
            fullPageBtn.on('click', function() {
                fullPage('#check');

            });
        })
        // 全屏预览图片
    function fullPage(arg) {
        var elem = $(arg)[0];
        if (elem.webkitRequestFullScreen) {
            elem.webkitRequestFullScreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.requestFullScreen) {
            elem.requestFullScreen();
        }
    }
});
