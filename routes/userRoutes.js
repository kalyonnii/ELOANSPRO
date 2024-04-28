const express = require("express");
const { adminLogin, userLogout } = require("../controllers/userController");
const router = express.Router();

router.route("/admin/login").post(adminLogin);

router.route("/logout").post(userLogout);

module.exports = router;
