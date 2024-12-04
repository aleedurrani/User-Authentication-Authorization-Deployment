const router = require("express").Router();
const verifyToken = require("./middleware");

const {
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
  } = require('../Controller/adminController')


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



module.exports = router;