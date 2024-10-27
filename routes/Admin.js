const express = require("express");

const { Adminlogin } = require("../controllers/admin");

const router = express.Router();
router.post("/login", Adminlogin);

module.exports = router;
