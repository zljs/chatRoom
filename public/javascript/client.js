$(document).ready(function() {
    $("#github").on('click', function() {
        window.open("https://github.com/zljs/chatRoom", "_blank");
    })
    var boxH = $("body").innerHeight(),
        boxW = $(".row").innerWidth();
    $("#biggest").on('click', function() {
        bigger();
    })

    function bigger() {
        if ($(".chat_box").hasClass('chat_box_new')) {

            $(".chat_header").stop().slideDown(400);
            $("#chat_list").stop().show(400);
            $(".chat_box").removeClass('chat_box_new').addClass('chat_box_old');
            $(".chat_box_old").css({
                "width": "85%",
                "height": "90%",
            });
            $("#biggest>span").css({
                "height": 15 + "px"
            });
        } else {
            $(".chat_header").stop().slideUp(400);


            $("#chat_list").stop().hide(400);

            $(".chat_box").removeClass('chat_box_old').addClass('chat_box_new');
            $(".chat_box_new").css({
                "width": boxW + 'px',
                "height": boxH + "px",
            });
            $("#biggest>span").css({
                "height": 0
            });
        };
    }
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
        if ($(".chat_box").hasClass('chat_box_new')) {

            $(".chat_header").stop().slideDown(400);
            $("#chat_list").stop().show(400);
            $(".chat_box").removeClass('chat_box_new').addClass('chat_box_old');
            $(".chat_box_old").css({
                "width": "85%",
                "height": "90%",
            });
            $("#biggest>span").css({
                "height": 15 + "px"
            });
        }


        if ($(".chat").stop().hide) {
            $(".chat").stop().show();
        };
        $("#msg").val('');
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
            $("#previewBox").stop().hide();
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
    // 发送图片
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
    // 发送消息
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
    // 匹配表情字符
    function replace_em(str) {
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
            $(".chat").stop().hide();
            $(".chat_header").stop().show(400);
            $("#chat_list").stop().show(400);
        };

    });
    // 接收消息
    var msgArr = [];
    socket.on('getMsg', function(newObj) {
            // console.log(newObj);
            msgArr.push(newObj);
            var isW, newContent, isme, isto, section,
                contentDiv = '',
                usernameDiv = '';

            for (let i in msgArr) {

                isW = (msgArr[i].flag === 'word') ? true : false;

                newContent = replace_em(msgArr[i].content);
                isme = (msgArr[i].fromName === self) ? true : false;
                isto = (msgArr[i].fromName === $("#touser").text()) ? true : false;
                if (isW) {
                    contentDiv = '<div class="clearfix">' + newContent + '</div>';
                } else {
                    contentDiv = '<div class="clearfix">' + '<img class="check" src="' + newContent + '"/>' + '</div>'
                };
                section = $('<section class="clearfix"></section>');
                if (isme) {
                    usernameDiv = '<span>' + msgArr[i].fromName + '</span>';
                    section.addClass('user');
                    section.html(contentDiv + usernameDiv);
                } else {
                    if (!isto) {
                        if ($(".chat").hide) {
                            $(".chat").show();
                        };
                        $("#touser").html(msgArr[i].fromName);
                        $("#showMsg").html('');
                    };
                    usernameDiv = '<span>' + msgArr[i].fromName + '</span>';
                    section.addClass('service');
                    section.html(usernameDiv + contentDiv);
                };
            }
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
