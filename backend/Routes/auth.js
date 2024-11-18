const router = require("express").Router();
const verifyToken = require("./middleware");
const AuthAdmin = require("./AuthAdmin");

const {RegisterUser, LoginUser, VerifyEmail, RegisterUserGoogle, LoginGoogle, GetUserProfile, ProtectedRoute} = require('../Controller/authController')

const {
    AdminRequests, 
    AdminRoles, 
    AdminPermissions, 
    getAllRoles, 
    verifyAdmin, 
    getAdminRequests, 
    approveRequest, 
    rejectRequest,
    searchUserByEmail,
    getUserDetails,
    updateUserPermissions,
    updateUserRoleAndStatus,
    getAllPermissions
} = require('../Controller/adminController')

 router.post('/register', RegisterUser);
 router.post('/login', LoginUser);
 router.post('/verifyEmail', VerifyEmail);
 router.post('/registerGoogle', RegisterUserGoogle);
 router.post('/loginGoogle', LoginGoogle);
 router.post('/getProfile', verifyToken, GetUserProfile);
 router.post('/protectedRoute', verifyToken, ProtectedRoute);


 router.get('/admin/requests', AuthAdmin, getAdminRequests);
 router.post('/admin/requests/:id/approve', AuthAdmin, approveRequest);
 router.post('/admin/requests/:id/reject', AuthAdmin, rejectRequest);
 router.post('/admin/verifyAdmin', verifyToken, verifyAdmin);
 router.get('/admin/roles', AuthAdmin, getAllRoles);

 router.get('/admin/users', AuthAdmin, searchUserByEmail);
 router.get('/admin/users/:id', AuthAdmin, getUserDetails);
 router.put('/admin/users/:id/permissions', AuthAdmin, updateUserPermissions);
 router.put('/admin/users/:id/role-status', AuthAdmin, updateUserRoleAndStatus);
 router.get('/admin/permissions', AuthAdmin, getAllPermissions);

 //router.get('/admin/roles', AuthAdmin, AdminRoles);
 //router.get('/admin/permissions', AuthAdmin, AdminPermissions);

module.exports = router;