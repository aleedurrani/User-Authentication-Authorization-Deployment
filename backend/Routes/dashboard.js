const router = require("express").Router();
const verifyToken = require("./middleware");

const { GetDashboardAnalytics } = require('../Controller/dashbaordController')


 router.post('/analytics', GetDashboardAnalytics);


module.exports = router;