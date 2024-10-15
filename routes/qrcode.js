const express = require("express");
const { generateQRCode } = require("../controllers/qrcode.js");
const { getAllQRCodes } = require("../controllers/qrcode.js");

const router = express.Router();

router.post("/generate", generateQRCode);
router.get("/allqrcode", getAllQRCodes);

module.exports = router;
