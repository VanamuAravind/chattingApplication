const mongoose = require('mongoose')

const conversationSchema=mongoose.Schema({
    friends:[
        {
            type:String
        }
    ],
    chat:[{
            room_id:String,
            message:String,
            sender:{
                _id:String,
                firstname:String,
                lastname:String,
                phone:String,
                email:String,
                password:String,
                iat:Number
            }
        }],
    room_id:{
        type:String,
        required:true
    }
})
const Conversation=mongoose.model('chat',conversationSchema)
module.exports={Conversation}