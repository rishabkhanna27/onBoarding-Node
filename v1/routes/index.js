const router = require("express").Router();
const UsersRoutes = require("./User");
const AdminRoutes = require("./Admin");

router.use("/User", UsersRoutes);
router.use("/Admin", AdminRoutes);

module.exports = router;
