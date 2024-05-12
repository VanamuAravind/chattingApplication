const express=require('express')
const app=express()
const http=require('http')
const {Server}=require('socket.io')
const cors=require('cors')
const db=require('./DB.js')
const dotenv=require("dotenv")
db.connectDB()
const server=http.createServer(app)

const { Conversation } = require('./models/conversations.js')


//importing all the routes from routes folder
const registerRoute=require('./routes/login.js').UserRouter

app.use(express.json())
app.use(cors())
dotenv.config()

const io=new Server(server,{
    cors:{
        origin:"http://localhost:3000",
        methods:["GET","POST"]
    }
})

const users_with_correspondign_RoomId={}
const curr_room_id=new Set()
const userId_corresponding_socketId={}
const socket_with_corresponding_user_id={}
io.on('connection',(socket)=>{
    socket.on('user_joined',(user_id)=>{
        userId_corresponding_socketId[user_id]=socket.id
        socket_with_corresponding_user_id[socket.id]=user_id
    })
    socket.on("join_room",(roomId,user1,user2)=>{
        socket.join(roomId)
        if(!curr_room_id.has(roomId)){
            // console.log(roomId,user1,user2)
            curr_room_id.add(roomId)
            users_with_correspondign_RoomId[user1]=roomId
            users_with_correspondign_RoomId[user2]=roomId
        }
    })
    socket.on("join_all_rooms",(roomId,user)=>{
        // console.log(roomId,user.firstname)
        socket.join(roomId)
    })

    socket.on('send_request',(from_user,to_user)=>{
        if(userId_corresponding_socketId[to_user]!=null){
            return socket.to(userId_corresponding_socketId[to_user]).emit("recieve_request",from_user)
        }
    })
    socket.on("accepted_request",(friend_id,user_id,room)=>{
        socket.to(userId_corresponding_socketId[friend_id]).emit("request_accepted",room)
    })

    socket.on("send_message",async(data)=>{
        if(curr_room_id.has(data.room_id)){
            socket.to(data.room_id).emit("recieve_message",data)
            // console.log(data)
        }
        else{
            // console.log("offline")
            const Room=data
            const chat=await Conversation.findOne({_id:Room.Room._id})
            if(chat){
                // console.log("room....",Room,"****************")
                const newMessage = {
                    room_id:Room.room_id,
                    message: Room.message,
                    sender: {
                    _id: Room.sender._id,
                    firstname: Room.sender.firstname,
                    lastname: Room.sender.lastname,
                    phone: Room.sender.phone,
                    email: Room.sender.email,
                    password: Room.sender.password,
                    iat: Room.sender.iat
                    }
                };

                chat.chat.push(newMessage);
                await chat.save();
            }
            else{
                // console.log("chat not found",data)
            }
        }
        // console.log(data)
    })

    socket.on('disconnect',()=>{
        const user_id=socket_with_corresponding_user_id[socket.id]
        delete socket_with_corresponding_user_id[socket.id]
        delete userId_corresponding_socketId[user_id]
        delete users_with_correspondign_RoomId[user_id]
    })
    socket.on('room_changes',(user_id)=>{
        socket.to(userId_corresponding_socketId[user_id]).emit("room_has_been_changed")
    })

})
function getNewRoom(){
    const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
    return randomNumber;
}


//app.use()
app.use("/",registerRoute)

server.listen(3001,()=>{
    console.log("server is up")
})