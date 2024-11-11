const router = require("express").Router();
const verifyToken = require("./middleware");
const AuthAdmin = require("./AuthAdmin");

const {RegisterUser, LoginUser, VerifyEmail, RegisterUserGoogle, LoginGoogle, GetUserProfile, ProtectedRoute} = require('../Controller/authController')

const {AdminRequests, AdminRoles, AdminPermissions} = require('../Controller/adminController')
const Admin = require("../Models/Admin");

 router.post('/register', RegisterUser);
 router.post('/login', LoginUser);
 router.post('/verifyEmail', VerifyEmail);
 router.post('/registerGoogle', RegisterUserGoogle);
 router.post('/loginGoogle', LoginGoogle);
 router.post('/getProfile', verifyToken, GetUserProfile);
 router.post('/protectedRoute', verifyToken, ProtectedRoute);
 router.get('/admin/requests', AuthAdmin, AdminRequests);
 router.get('/admin/roles', AuthAdmin, AdminRoles);
 router.get('/admin/permissions', AuthAdmin, AdminPermissions);
 



module.exports = router;