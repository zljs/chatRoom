$(document).ready(function() {
    var self = $("#showselfname")[0].innerText.trim();
    console.log(self)

    var socket = io.connect();
    socket.emit('login', {
        username: self
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
            from: self,
            to: touser
        })
        $("#touser").html(touser);
        $("#showMsg").html('');

        now_chat_list.push(touser);

        upArr(now_chat_list);

        if (now_chat_list.length > 5) {
            now_chat_list.splice(0, 1);
        };
        // console.log(now_chat_list);
        $("#send").on('click', function() {
            var msg = $("#msg").val();
            socket.emit('getMsg', {
                from: self,
                content: msg,
                to: $("#touser").text()
            })
        })
    });

    $(".back").on('click', function() {
        now_chat_list.pop();
        $("#touser").html(now_chat_list[now_chat_list.length - 1]);
        if (now_chat_list.length == 0) {
            $(".chat").hide();
        };
        // console.log(now_chat_list);


    });
    socket.on('getChat', function(data, listRoom) { //如果广播到用户包含自己，则匹配聊天
            console.log(data)
        })
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

            var newContent = newObj.content;
            var isme = (newObj.fromName === self) ? true : false;
            var isto = (newObj.fromName === $("#touser").text()) ? true : false;
            var contentDiv = '<div>' + newContent + '</div>';
            var usernameDiv = '';
            console.log(isto)

            var section = $('<section class="clearfix"></section>');
            if (isme) {
                usernameDiv = '<span>' + newObj.fromName + '</span>';
                section.addClass('user');
                section.html(contentDiv + usernameDiv);
            } else {
                if (isto) {
                    usernameDiv = '<span>' + newObj.fromName + '</span>';
                    section.addClass('service');
                    section.html(usernameDiv + contentDiv);
                } else {
                    if ($(".chat").hide) {
                        $(".chat").show();
                    };
                    $("#touser").html(newObj.fromName);
                    $("#showMsg").html('');
                    usernameDiv = '<span>' + newObj.fromName + '</span>';
                    section.addClass('service');
                    section.html(usernameDiv + contentDiv);
                };
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

});
