const User =require('../models/user');


const createUser =async(req,res)=>{
    const {name ,email,password} =req.body;
    if(!name ||!email||!
}