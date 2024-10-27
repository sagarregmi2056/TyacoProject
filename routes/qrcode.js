const express = require("express");
const {
  generateQRCode,
  searchItemByItemNumber,
  getAllQRCodes,
} = require("../controllers/qrcode.js");
// const { getAllQRCodes } = require("../controllers/qrcode.js");

const router = express.Router();

router.post("/generate", generateQRCode);
router.get("/allqrcode", getAllQRCodes);
router.get("/search", searchItemByItemNumber);

module.exports = router;
