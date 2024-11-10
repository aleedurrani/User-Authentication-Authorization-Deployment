const router = require("express").Router();
const verifyToken = require("./middleware");

const {RegisterUser, LoginUser, VerifyEmail, RegisterUserGoogle, LoginGoogle, GetUserProfile, ProtectedRoute} = require('../Controller/authController')

 router.post('/register', RegisterUser);
 router.post('/login', LoginUser);
 router.post('/verifyEmail', VerifyEmail);
 router.post('/registerGoogle', RegisterUserGoogle);
 router.post('/loginGoogle', LoginGoogle);
 router.post('/getProfile', verifyToken, GetUserProfile);
 router.post('/protectedRoute', verifyToken, ProtectedRoute);
 



module.exports = router;