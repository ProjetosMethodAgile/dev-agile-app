const jwt = require('jsonwebtoken');

async function checkTokenLogin(req,res,next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1]
  
    if(!token){
      return res.status(401).json({message: "acesso negado", error:true})
    }

    try{
        const secret = process.env.SECRET_LOGIN
        jwt.verify(token, secret)
        next()
    }catch(e){
       return res.status(400).json({message:"token invalido"})
    }
}

module.exports = checkTokenLogin;