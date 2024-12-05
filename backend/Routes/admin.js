const router = require("express").Router();
const verifyToken = require("./middleware");

const {LoginAdmin,
     ProtectedRouteAdmin,
    GetAdminProfile, 
    GetAllRequests,
    ProcessRequest,
    GetAllUsers,
    GetUserProfile,
    GetAvailableRoles,
    RoleChange,
    GetAvailablePermissions,
    PermissionChange,
    GetRolePermissions,
    RemoveRole,
    RemovePermissions,
    GetAvailableRemovePermissions,
    CreatePrimaryRole,
    GetAllPrimaryRoles,
    CreateSubRole} = require('../Controller/adminController')


 router.post('/loginAdmin', LoginAdmin);
 router.post('/getAllPrimaryRoles', GetAllPrimaryRoles);
 router.post('/protectedRouteAdmin', verifyToken, ProtectedRouteAdmin);
 router.post('/getProfile', verifyToken, GetAdminProfile);
 router.post('/getAllRequests', verifyToken, GetAllRequests);
 router.post('/processRequest', verifyToken, ProcessRequest);
 router.get('/getAllUsers', verifyToken, GetAllUsers);
 router.post('/getUserProfile', verifyToken, GetUserProfile);
 router.post('/getAvailableRoles', verifyToken, GetAvailableRoles);
 router.post('/roleChange', verifyToken, RoleChange);
 router.post('/getAvailablePermissions', verifyToken, GetAvailablePermissions);
 router.post('/permissionChange', verifyToken, PermissionChange);
 router.post('/getRolePermissions', verifyToken, GetRolePermissions);
 router.post('/removeRole', verifyToken, RemoveRole);
 router.post('/removePermissions', verifyToken, RemovePermissions);
 router.post('/getAvailablePermissionsToRemove', verifyToken, GetAvailableRemovePermissions);
 router.post('/createPrimaryRole', verifyToken, CreatePrimaryRole);
 router.post('/createSubRole', verifyToken, CreateSubRole);


module.exports = router;