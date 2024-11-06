const router = require("express").Router();
const verifyToken = require("./middleware");

const {RegisterUser, LoginUser, VerifyEmail, RegisterUserGoogle} = require('../Controller/authController')

 router.post('/register', RegisterUser);
 router.post('/login', LoginUser);
 router.post('/verifyEmail', VerifyEmail);
 router.post('/registerGoogle', RegisterUserGoogle);
 //router.post('/getProfile', verifyToken, GetUserProfile);
 //abc



module.exports = router;