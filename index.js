const expressValidator = require("express-validator");

const path = require("path");
const express = require("express");
require("express-async-errors");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 8525;

const { errorHandler } = require("./helpers");
const logger = require("./helpers/logger");

const { connectToDatabase } = require("./helpers/dbConnection");

connectToDatabase();

logger(app);
app.use(cors());
app.use(express.json());
// app.use(expressValidator());
app.use(express.static(path.join(__dirname, "uploads")));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to Tyaco API");
});

app.use("/api/auth-user", require("./routes/auth-user"));
app.use("/api/qrcode", require("./routes/qrcode"));

async function startServer() {
  app.listen(port, () => {
    console.log(
      `Server is running on port ${port} at ${process.env.NODE_ENV} mode`
    );
  });
}

app.use(function (err, req, res, next) {
  return res.status(500).json({
    error: errorHandler(err) || "Something went wrong! ****SERVER_ERROR****",
  });
});

// to start the above function
startServer();
