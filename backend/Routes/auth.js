const router = require("express").Router();
const verifyToken = require("./middleware");

const {RegisterUser, LoginUser} = require('../Controller/authController')

 router.post('/register', RegisterUser);
 router.post('/login', LoginUser);
 //router.post('/getProfile', verifyToken, GetUserProfile);
 



module.exports = router;