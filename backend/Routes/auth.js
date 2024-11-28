const router = require("express").Router();
const verifyToken = require("./middleware");

const {RegisterUser, LoginUser, VerifyEmail, RegisterUserGoogle, LoginGoogle, GetUserProfile, ProtectedRoute, GetRequests, RoleChange, PermissionChange, VerifyUserCredentials, UpdateUserPassword, GetAvailableRoles, GetAvailablePermissions, LoginAdmin, ProtectedRouteAdmin} = require('../Controller/authController')

 router.post('/register', RegisterUser);
 router.post('/login', LoginUser);
 router.post('/verifyEmail', VerifyEmail);
 router.post('/verifyUser', VerifyUserCredentials);
 router.post('/registerGoogle', RegisterUserGoogle);
 router.post('/loginGoogle', LoginGoogle);
 router.post('/updatePassword', UpdateUserPassword);
 router.post('/getProfile', verifyToken, GetUserProfile);
 router.post('/protectedRoute', verifyToken, ProtectedRoute);
 router.get('/getAvailableRoles', verifyToken, GetAvailableRoles);
 router.get('/getAvailablePermissions', verifyToken, GetAvailablePermissions);
 router.post('/getRequests', verifyToken, GetRequests);
 router.post('/roleChange', verifyToken, RoleChange);
 router.post('/permissionChange', verifyToken, PermissionChange);
 


module.exports = router;