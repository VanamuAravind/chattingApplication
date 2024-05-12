const mongoose=require('mongoose')
async function connectDB(){
    await mongoose.connect("mongodb+srv://aravind:1234@chatapp.wjydvyc.mongodb.net/mainDB")
    .then(()=>{
        console.log("database is connected")
    })
}

module.exports={connectDB}