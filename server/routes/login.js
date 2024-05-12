const express=require('express')
const UserRouter=express.Router()
const usermiddleware=require('../middlewares/userAuth.js')
const User=require('../models/users.js').User
const jwt=require('jsonwebtoken')
const secret_key="AJHA%^&*%SDB^&*(56789"

const { Requests } = require('../models/requests.js')
const { Conversation } = require('../models/conversations.js')



UserRouter.post("/register",usermiddleware.validate,async(req,res)=>{
    console.log("user is valid")
    const user_with_email=await User.findOne({email:req.body.email})
    if(user_with_email){
        res.json({message:"user with email already exsists"})
    }
    else{
        const user=await new User(req.body)
        user.save()
        res.json({message:"user created"})
    }
})

UserRouter.post("/login",async(req,res)=>{
    if(!usermiddleware.validEmail(req.body.email)){
        return res.json({message:"email is not valid"})
    }
    if(!usermiddleware.validatePassword(req.body.password)){
        return res.json({message:"password is not valid"})
    }
    try {
        // console.log(req.body)
        const user=await User.findOne({ email : req.body.email })
        // console.log(user)
        if(user){
            if(user.password===req.body.password){
                const obj={
                    _id:user._id,
                    firstname:user.firstname,
                    lastname:user.lastname,
                    phone:user.phone,
                    email:user.email
                }
                const token=jwt.sign(obj,secret_key)
                // console.log(token)
                res.json({
                    message:"user loggedin",
                    token:token
                })
            }
            else{
                console.log("something")
                res.json("invalid username or password")
            }
        }
        else{
            console.log("not found")
            res.json({message:"email or password is invalid"})
        }
            
    } catch (error) {
        res.json({message:"internal server error"})
    }
})

UserRouter.post("/userdata",(req,res)=>{
    const {token}=req.body
    // console.log(token)
    if(!token){
        return res.json({message:"no token"})
    }
    try {
        const data=jwt.verify(token,secret_key)
        // console.log(data)
        res.json(data)
    } catch (error) {
        res.json({message:"error finding token"})
    }
})


UserRouter.post('/findUser',async (req,res)=>{
    const user=await User.findOne({email:req.body.email})
    if(user){
        res.status(200).json(user)
    }
    else{
        res.status(401).json({message:"user not found"})
    }
})

UserRouter.post("/findUserById",async (req,res)=>{
    const user=await User.findOne({_id:req.body.user_id})
    if(user){
        res.status(200).json(user)
    }
    else{
        res.status(401).json({message:"user not found"})
    }
})


UserRouter.post("/sendRequest",async (req,res)=>{
    const {from,to}=req.body
    let request_for_user=await Requests.findOne({user_id:to})
    if(!request_for_user){
        request_for_user=await new Requests({user_id:to})
    }
    for(let i=0;i<request_for_user.requests.length;i++){
        if(request_for_user.requests[i]==from){
            return res.status(401).json({message:"request already sent"})
        }
    }
    request_for_user.requests.push(from)
    await request_for_user.save()
    res.status(200).json({message:"request sent"})
})


UserRouter.post("/getRequests",async (req,res)=>{
    const {user_id}=req.body
    // console.log(user_id)
    const user=await Requests.findOne({user_id:user_id})
    if(user){
        const requests=user.requests
        res.status(200).json({requests:requests})
    }
    else{
        res.json({message:"no requests"})
    }
})

UserRouter.post("/rejectRequest",async (req,res)=>{
    const {user_id,friend_request} = req.body
    const user=await Requests.findOne({user_id:user_id})
    if(user){
        const filtered_request=user.requests.filter(request=>request!==friend_request)
        user.requests=filtered_request
        await user.save()
        return res.status(200).json({message:"declined the request"})
    }
    res.json({message:"internal server error"})
})

UserRouter.post("/addfriend",async (req,res)=>{
    const {user1_id,user2_id}=req.body
    const chat=await new Conversation({room_id:generateRoomID()})
    
    if(chat){
        chat.friends.push(user1_id)
        chat.friends.push(user2_id)
        chat.save()
        //adding chat id into both users conversation ids
        const user1=await User.findOne({_id:user1_id})
        const user2=await User.findOne({_id:user2_id})
        if(user1){
            user1.conversation_ids.push(chat._id)
            user1.save()
        }
        if(user2){
            user2.conversation_ids.push(chat._id)
            user2.save()
        }

        res.status(200).json({room:chat._id})
    }
    else{
        res.status(400).json({message:"internal server error"})
    }
})

function generateRoomID(){
    const min = 10000000;
    const max = 99999999;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNumber;
}


UserRouter.post("/getConversations",async (req,res)=>{
    const {user_id}=req.body
    const user=await User.findOne({_id:user_id})
    if(user){
        const conversations=user.conversation_ids
        res.status(200).json({rooms:conversations})
    }
    else{
        res.status(401).json({message:"internal server error"})
    }
})

UserRouter.post("/getUserIdsFromRoomId",async (req,res)=>{
    const {room_id}=req.body
    const room=await Conversation.findOne({_id:room_id})
    if(room){
        // console.log(room)
        res.status(200).json(room)
    }
    else{
        res.status(401).json({message:"room not found"})
    }
})

UserRouter.post("/saveChat",async (req,res)=>{
    // console.log(req.body)
    const Room=req.body
    const chat=await Conversation.findOne({_id:req.body.Room._id})
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
          res.json(chat)
    }
    else{
        res.status(401).json({message:"no room exists"})
    }
})



module.exports={UserRouter}