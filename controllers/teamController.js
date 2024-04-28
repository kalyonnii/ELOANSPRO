const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnection");
const handleGlobalFilters = require("../middleware/filtersHandler");
const parseNestedJSON = require("../middleware/parseHandler");
const {
  createClauseHandler,
  updateClauseHandler,
} = require("../middleware/clauseHandler");
const handleRequiredFields = require("../middleware/requiredFieldsChecker");
const { generateRandomNumber } = require("../middleware/valueGenerator");

const createTeam = asyncHandler((req, res) => {
  let teamId = "T-" + generateRandomNumber(6);
  req.body["teamId"] = teamId;
  req.body["teamInternalStatus"] = 1;
  req.body["lastTeamInternalStatus"] = 1;

  const createClause = createClauseHandler(req.body);
  const sql = `INSERT INTO team (${createClause[0]}) VALUES (${createClause[1]})`;

  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error creating team :", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    res.status(200).send(true);
  });
});

const updateTeam = asyncHandler((req, res) => {
  const id = req.params.id;
  const checkRequiredFields = handleRequiredFields("team", req.body);
  if (!checkRequiredFields) {
    res.status(422).send("Please Fill all required fields");
    return;
  }
  const updateClause = updateClauseHandler(req.body);
  const sql = `UPDATE team SET ${updateClause} WHERE id = ${id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      // throw err;
      console.log("updateteam error in controller");
    }
    res.status(200).send(result);
  });
});

const deleteTeam = asyncHandler((req, res) => {
  const sql = `DELETE FROM team WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      // throw err;
      console.log("deleteteam error in controller");
    }
    res.status(200).send("Lead Deleted Successfully");
  });
});

const getTeamById = asyncHandler((req, res) => {
  const sql = `SELECT * FROM team WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      // throw err;
      console.log("getTeamById error in controller");
    }
    result = parseNestedJSON(result);
    //console.log(result)
    res.status(200).send(result[0]);
  });
});

const getTeam = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM team";
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      // throw err;
      console.log("getTeam Error in controller");
    }

    result = parseNestedJSON(result);
    res.status(200).send(result);
  });
});

const changeTeamStatus = asyncHandler((req, res) => {
  const id = req.params.teamId;
  const statusId = req.params.statusId;
  const createSql = `SELECT * FROM team WHERE id = ${id}`;
  dbConnect.query(createSql, (err, result) => {
    if (err) {
      console.log("changeTeamStatus error:");
    }
    if (result && result[0] && statusId) {
      let statusData = {
        lastTeamInternalStatus: result[0].teamInternalStatus,
        teamInternalStatus: statusId,
      };
      const updateClause = updateClauseHandler(statusData);
      const sql = `UPDATE team SET ${updateClause} WHERE id = ${id}`;
      dbConnect.query(sql, (err, result) => {
        if (err) {
          console.log("changeteamStatus and updatecalss error:");
        }
        res.status(200).send(true);
      });
    } else {
      res.status(422).send("No team  Found");
    }
  });
});

const getTeamCount = asyncHandler(async (req, res) => {
    let sql = "SELECT count(*) as teamCount FROM team";
    const filtersQuery = handleGlobalFilters(req.query, true);
    sql += filtersQuery;
    //console.log(sql)
    
    dbConnect.query(sql, (err, result) => {
      if (err) {
        console.log("Error in getTeamCount:", err);
        res.status(500).send("Internal Server Error");
      } else {
        const teamCount = result[0]["teamCount"];
        //console.log(teamCount);
        res.status(200).send(String(teamCount));
      }
    });
  });
  
module.exports = {
  createTeam,
  deleteTeam,
  updateTeam,
  getTeamById,
  getTeam,
  changeTeamStatus,
  getTeamCount,
};
