const sendToken=(user,statusCode,res)=>{

    const token = user.getJWTToken();

    const options = {
        expires:{
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        }
    }
}