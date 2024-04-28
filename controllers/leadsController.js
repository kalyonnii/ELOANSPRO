const asyncHandler = require("express-async-handler");
const dbConnect = require("../config/dbConnection");
const handleGlobalFilters = require("../middleware/filtersHandler");
const parseNestedJSON = require("../middleware/parseHandler");
const { createClauseHandler, updateClauseHandler } = require("../middleware/clauseHandler");
const handleRequiredFields = require("../middleware/requiredFieldsChecker");
const { generateRandomNumber } = require("../middleware/valueGenerator");

const getLeadsCount = asyncHandler(async (req, res) => {
  let sql = "SELECT count(*) as leadsCount FROM leads";
  const filtersQuery = handleGlobalFilters(req.query,true);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      // throw err;
      console.log("getLeadsCount error in controller")
    }
    const leadsCount = result[0]['leadsCount'];
    res.status(200).send(String(leadsCount))
  });
});


const getLeads = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM leads";
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      // throw err;
      console.log("getLeads Error in controller")
    }

    result = parseNestedJSON(result);
    res.status(200).send(result);
  });
});


const getLeadSources = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM leadSources";
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      // throw err;
      console.log("getLeadSourcs Error in Controller")
    }
    result = parseNestedJSON(result);
    res.status(200).send(result);
  });
});

const getLeadUsers = asyncHandler(async (req, res) => {
  let sql = "SELECT * FROM users";
  const filtersQuery = handleGlobalFilters(req.query);
  sql += filtersQuery;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      // throw err;
      console.log("getLeadUsers error in controller")
    }
    result = parseNestedJSON(result);
    res.status(200).send(result);
  });
});


const getLeadById = asyncHandler((req, res) => {
  const sql = `SELECT * FROM leads WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      // throw err;
      console.log("getLeadById error in controller")
    }
    result = parseNestedJSON(result);
    //console.log(result)
    res.status(200).send(result[0]);
  });
});


const getLeadDocumentsById = asyncHandler((req, res) => {
  const sql = `SELECT * FROM leaddocuments WHERE leadId = ${req.params.leadId}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      // throw err;
      console.log("getLeadDocumentsById Error in controller")
    }
    result = parseNestedJSON(result);
    res.status(200).send(result[0] || {});
  });
});

const addDocumentData = asyncHandler((req, res) => {
  const id = req.params.leadId;
  const updateClause = updateClauseHandler(req.body);
  console.log(updateClause)
  console.log(id)
  const sql = `UPDATE leaddocuments SET ${updateClause} WHERE leadId = ${id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      // throw err;
      console.log("addDocumentData error in controller")
    }
    console.log(result)
    res.status(200).send(result);
  });
});

// const createLead = asyncHandler((req, res) => {
//   let leadId = 'L-' + generateRandomNumber(6);
//   req.body['leadId'] = leadId;
//   req.body['leadInternalStatus'] = 1;
//   req.body['lastLeadInternalStatus'] = 1;
//   // req.body['createdBy'] = createdBy;
//   // req.body['lastUpdatedBy'] = lastUpdatedBy;
//   const createClause = createClauseHandler(req.body);
//   // const checkRequiredFields = handleRequiredFields('leads', req.body);
//   // if (!checkRequiredFields) {
//   //   res.status(422).send("Please Fill all required fields");
//   //   return;
//   // }
//   const sql = `INSERT INTO leads (${createClause[0]}) VALUES (${createClause[1]})`;
//   dbConnect.query(sql, (err, result) => {
//     if (err) {
//       // throw err;

//       console.log("createLead error in controller")
//     }
//     res.status(200).send(true);
//   });
// });



const createLead = asyncHandler((req, res) => {
  let leadId = 'L-' + generateRandomNumber(6);
  req.body['leadId'] = leadId;
  req.body['leadInternalStatus'] = 1;
  req.body['lastLeadInternalStatus'] = 1;

  const createClause = createClauseHandler(req.body);
  const sql = `INSERT INTO leads (${createClause[0]}) VALUES (${createClause[1]})`;

  dbConnect.query(sql, (err, result) => {
    if (err) {
      console.error("Error creating lead:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    const id = result.insertId;
    // Insert leadId into leaddocuments table
    const leaddocumentsSql = `INSERT INTO leaddocuments (leadId) VALUES ('${id}')`;
    dbConnect.query(leaddocumentsSql, (leaddocumentsErr, leaddocumentsResult) => {
      if (leaddocumentsErr) {
        console.error("Error inserting leadId into leaddocuments table:", leaddocumentsErr);
        // Rollback lead insertion in leads table
        const rollbackSql = `DELETE FROM leads WHERE leadId = '${id}'`;
        dbConnect.query(rollbackSql, rollbackErr => {
          if (rollbackErr) {
            console.error("Error rolling back lead insertion in leads table:", rollbackErr);
          }
          res.status(500).send("Internal Server Error");
        });
        return;
      }

      res.status(200).send(true);
    });
  });
});


const updateLead = asyncHandler((req, res) => {
  const id = req.params.id;
  const checkRequiredFields = handleRequiredFields('leads', req.body);
  if (!checkRequiredFields) {
    res.status(422).send("Please Fill all required fields");
    return;
  }
  const updateClause = updateClauseHandler(req.body);
  const sql = `UPDATE leads SET ${updateClause} WHERE id = ${id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      // throw err;
      console.log("updateLead error in controller")
    }
    res.status(200).send(result);
  });
});

const deleteLead = asyncHandler((req, res) => {
  const sql = `DELETE FROM leads WHERE id = ${req.params.id}`;
  dbConnect.query(sql, (err, result) => {
    if (err) {
      // throw err;
      console.log("deleteLead error in controller")
    }
    res.status(200).send("Lead Deleted Successfully");
  });
});

const changeLeadStatus = asyncHandler((req, res) => {
  const id = req.params.leadId;
  const statusId = req.params.statusId;
  const createSql = `SELECT * FROM leads WHERE id = ${id}`;
  dbConnect.query(createSql, (err, result) => {
    if (err) {
      // throw err;
      console.log("changeLeadStatus error in controller")
    }
    if (result && result[0] && statusId) {
      let statusData = {
        lastLeadInternalStatus: result[0].leadInternalStatus,
        leadInternalStatus: statusId
      }
      const updateClause = updateClauseHandler(statusData);
      const sql = `UPDATE leads SET ${updateClause} WHERE id = ${id}`;
      dbConnect.query(sql, (err, result) => {
        if (err) {
          // throw err;
          console.log("changeLeadStatus error in controller")
        }
        res.status(200).send(true);
      });
    }
    else {
      res.status(422).send("No Leads Found");
    }
    // const updateClause = updateClauseHandler(req.body);
    // const sql = `UPDATE leads SET ${updateClause} WHERE id = ${id}`;
    // dbConnect.query(sql, (err, result) => {
    //   if (err) {
    //     throw err;
    //   }
    //   res.status(404).send("No Lead Found");
    // });
  });
});


module.exports = {
  getLeads,
  getLeadSources,
  getLeadUsers,
  getLeadsCount,
  getLeadById,
  getLeadDocumentsById,
  createLead,
  updateLead,
  deleteLead,
  changeLeadStatus,
  addDocumentData
};
