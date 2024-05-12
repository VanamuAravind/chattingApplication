const mongoose=require('mongoose')

const UserSchema=mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    conversation_ids:[
        {
            type:String
        }
    ]
})

const User=mongoose.model("users",UserSchema)
module.exports={User}