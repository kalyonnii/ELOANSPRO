const express = require("express");
const { adminLogin, userLogout } = require("../controllers/userController");
const { createTeam, getTeam, getTeamById, updateTeam, deleteTeam,changeTeamStatus ,getTeamCount} =require("../controllers/teamController");
const {changeLeadStatus} =require("../controllers/leadsController")
const validateToken = require("../middleware/validateTokenHandler");

const router = express.Router();

router.route("/").get(validateToken, getTeam).post(validateToken, createTeam);
router.route("/total").get(validateToken,  getTeamCount); 
router.route("/:teamId/changestatus/:statusId").put(validateToken, changeTeamStatus);

router
  .route("/:id")
  .get(validateToken, getTeamById)
  .put(validateToken, updateTeam)
  .delete(validateToken, deleteTeam);

module.exports = router;
