function validate(req,res,next){
    const {firstname,lastname,phone,email,password}=req.body
    if(!firstname){
        res.json({message:"firstname must not be empty"})
    }
    if(!lastname){
        res.json({message:"lastname must not be empty"})
    }
    if(phone.length!=10){
        res.json({message:"invalid phone number"})
    }
    if(!validEmail(email)){
        res.json({message:"enter valid email"})
    }
    if(!validatePassword(password)){
        res.json({message:"enter valid password"})
    }
    next()

}

function validatePassword(password){
    if(password.length<8){
        return false
    }
    return true
}

function validEmail(email){
    const l=email.split("@")
    if(l.length!=2){
        return false
    }
    if(!l[0]){
        return false
    }
    if(!l[1]){
        return false
    }

    const domain=l[1]
    const d=domain.split(".")
    if(d.length!=2){
        return false
    }
    if(!d[0]){
        return false
    }
    if(!d[1]){
        return false
    }
    return true
}
module.exports={validate,validEmail,validatePassword}