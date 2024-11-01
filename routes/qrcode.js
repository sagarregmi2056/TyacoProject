const express = require("express");
const {
  generateQRCode,

  getAllQRCodes,
  searchItemByNumber,
} = require("../controllers/qrcode.js");
// const { getAllQRCodes } = require("../controllers/qrcode.js");

const router = express.Router();

router.post("/generate", generateQRCode);
router.get("/allqrcode", getAllQRCodes);
router.get("/search", searchItemByNumber);

module.exports = router;
