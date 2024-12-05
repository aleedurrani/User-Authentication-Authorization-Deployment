const router = require("express").Router();
const verifyToken = require("./middleware");

const {
    GetAllRequests,
    ProcessRequest,
   } = require('../Controller/adminController')



 router.post('/getAllRequests', verifyToken, GetAllRequests);
 router.post('/processRequest', verifyToken, ProcessRequest);
 

module.exports = router;