const mongoose=require('mongoose')

const requestSchema=mongoose.Schema({
    user_id:{
        type:String,
        required:true
    },
    requests:[
        {
            type:String,
        }
    ]
})

const Requests=mongoose.model('requests',requestSchema)
module.exports={Requests}