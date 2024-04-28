const express = require("express");
const cors = require("cors");
const path = require('path');
const validateToken = require("./middleware/validateTokenHandler");
const app = express();
app.use(express.json());
app.use(cors({
  origin: '*'
}));

app.use("/user", require("./routes/userRoutes"));

app.use("/leads", require("./routes/leadsRoutes"));

app.use("/callbacks", require("./routes/callbackRoutes"));

app.use("/files", require("./routes/fileHandlerRoutes"));

app.use("/counts",require("./routes/allCountRoutes"));

app.use("/team",require("./routes/teamRoutes"));

app.use("/uploads", express.static(path.join(__dirname, 'uploads')));

app.listen(process.env.PORT, () => {
  console.log("Server Running Peacefully");
});
