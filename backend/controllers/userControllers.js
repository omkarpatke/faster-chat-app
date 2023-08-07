const asyncHandler = require('express-async-handler');
const User = require("../Modals/userModal");
const  genrateToken  = require('../config/genrateToken');
const bcrypt = require('bcryptjs');


const registerUser = asyncHandler(async(req , res) => {
   const  { name , email  , password, pic } = req.body;

   if(!name || !email  || !password){
    resizeBy.status(400);
    throw new Error('Please Enter all the Fields');
   }

   const userExits = await User.findOne( {email} );

   if(userExits){
    res.status(400);
    throw new Error("User already exists");
   }

   const user = await User.create({
    name , email , password , pic
   });

   if(user){
    res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token : genrateToken(user._id),
    });
   }else{
    res.status(400);
    throw new Error('Failed to Create the User');
   }
});


const authUser = asyncHandler(async(req , res) => {
    const { email , password } = req.body;
   
    const userExits = await User.findOne( {email} );


    if (userExits && (await bcrypt.compare(password  , userExits.password))){
        res.json({
            _id: userExits._id,
            name: userExits.name,
            email: userExits.email,
            pic: userExits.pic,
            token : genrateToken(userExits._id),
        });
    }else{
        res.status(400);
        throw new Error('Failed to Find the User');
    }
})

const allUsers = asyncHandler(async(req , res) => {
   const keyword = req.query.search ? {
    $or: [
        { name: { $regex: req.query.search , $options: "i"}},
        { email: { $regex: req.query.search , $options: "i"}},
    ]
   } : {};

   const users = await User.find(keyword).find({_id:{ $ne: req.user._id }})

   res.send(users);
});

module.exports = { registerUser , authUser  , allUsers};