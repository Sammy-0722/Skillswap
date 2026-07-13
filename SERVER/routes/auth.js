const express = require("express");
const router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const User = require('../models/usercred');

router.post("/register",async(req,res)=>{
try{
    const{name,email,password }= req.body;
    if(!name || !email || !password){
        return res.status(400).json({message:"please enter the details"})
    }
    let user = await User.findOne({email});
    if(user){
        return  res.status(400).json({message:"user alerady exist"});
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);
    user=new User({
        name,
        email,
        password:hashedPassword
    });
    await user.save();

    const payload = {
        user: {
            id: user.id,
            email: user.email,
        }
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
        success: true,
        message: "User created successfully",
        token,
        email: user.email,
        id: user.id
    });
}catch(err){
     console.error("REGISTER ERROR:", err);
    res.status(500).json({message:"server error"});
}
});


router.post('/login',async(req,res)=>{
    try{
        const {email,password} = req.body;
        if( !email || !password){
            return res.status(400).json({message:"please provide name ,email and password"});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message:"invalid credentials"})
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
           return res.status(404).json({message:"inavlid credentials"})
        }

        const payload ={
            user :{
                id:user.id,
                email : user.email,
            }
        };
        const token = jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:'24h'});
        res.json({
            success :true,
            token,
            email:user.email,
            id:user.id
        });
    }catch(err){
        console.error(err.message);
        res.status(500).json({message:"server error"});
    }
});
router.get('/verify', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: decoded.user });

  } catch (err) {
    res.status(401).json({ valid: false, message: 'Token is not valid' });
  }
});

module.exports = router;