var express =require('express');
var app = express();
var server = require('http').createServer(app);

app.use(express.static(__dirname));
var user = [],messageList=[];

var io = require('socket.io')(server);
io.on('connection',function(socket){
//    当连接时，返回当前用户数量和名称;

//    当用户进行判断的时候;
    socket.on('userCount',function(username){
       // 传过来的是一个字符串:用户的名字；
           var obj ={}; obj.name = username,obj.id = null;
           obj.id = user.length ==0?0:user[user.length-1].id+1;
           // 判断用户列表组是否存在该用户，存在则不添加;
           var flag = user.some(function(item){
               return item.name ==obj.name;
           });
           if(!flag){
               user.push(obj);
           };
           messageList.push(obj);
           io.sockets.emit('userCount',user);
           io.sockets.emit('message',messageList);
    });
    socket.on('leaveUser',function(username){
        user.filter(function(item){
            return item !=username;
        })
    });
    socket.on('message',function(data){
        //接收到的是一个对象{name:'a',msg:'b'}
         //通过@判断发送的信息;
        var msg = data.msg;
        if(msg){
            msg.replace(/</g,"&<");
            msg.replace(/>/g,"&>");
        }

        if(msg == []){

        } else{
           //如果消息中的第一个字母为@,则是私聊,否则是公聊;
            if(msg.charAt(0) == '@'){
                var reg = /^(@)(.+)\s(.+)$/g;
                var arr = reg.exec(msg);
            //["@zhangsan weojsf", "@", "zhangsan", "weojsf"]
                var privateChatUser = user.filter(function(item){
                    return item.name == arr[2];
                });
                io.sockets.socket(privateChatUser.id).emit('message',privateChatUser);
            } else {
                messageList.push(data);
                io.sockets.emit('message',messageList);
            }

        }
    });
    socket.on('userLeave',function(data){
        user.filter(function(item){
            return item != data ;
        })
    })
});
io.on('disconnect',function(data){
    user.filter(function(item){
        return item != data ;
    })
})

server.listen(70,function(){
    console.log('ok');
});