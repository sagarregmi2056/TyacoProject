const QRCode = require("qrcode");
const QRCodeModel = require("../models/QRCode");
const path = require("path");
const Jimp = require("jimp");
const { v4: uuidv4 } = require("uuid");
// Path to the logo you want to overlay on the QR code
const logoPath = path.join(__dirname, "..", "uploads", "logo.png");

// exports.generateQRCode = async (req, res) => {
//   const { numberOfPackets, details } = req.body;

//   try {
//     // Generate QR code data string
//     const qrCodeData = `Packets: ${numberOfPackets}, Details: ${details}`;

//     // Generate QR code image as a Data URL (base64 encoded image)
//     const qrCodeImage = await QRCode.toDataURL(qrCodeData);

//     // Save the QR code information and image URL in the database
//     const qrCodeEntry = new QRCodeModel({
//       numberOfPackets,
//       details,
//       qrCodeUrl: qrCodeImage, // Save the base64 encoded QR code image
//     });

//     await qrCodeEntry.save();

//     // Respond with the QR code image and stored information
//     res.status(201).json({
//       message: "QR Code generated successfully",
//       qrCodeImage: qrCodeImage,
//       qrCodeEntry: qrCodeEntry,
//     });
//   } catch (error) {
//     console.error("Error generating and saving QR code:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// exports.generateQRCode = async (req, res) => {
//   const { numberOfPackets, details } = req.body;

//   try {
//     // Generate QR code data string
//     const qrCodeData = `Packets: ${numberOfPackets}, Details: ${details}`;

//     // Define the file path where the QR code will be saved
//     const qrCodeFileName = `qrcode_${Date.now()}.png`;
//     const qrCodeFilePath = path.join(__dirname, "../uploads", qrCodeFileName);

//     // Generate the QR code image and save it to the file system
//     await QRCode.toFile(qrCodeFilePath, qrCodeData);

//     // Generate the public URL for the QR code (assuming you're serving static files)
//     const qrCodeUrl = `/qrcodes/${qrCodeFileName}`;

//     // Save the QR code information and the URL in the database
//     const qrCodeEntry = new QRCodeModel({
//       numberOfPackets,
//       details,
//       qrCodeUrl, // Save the file URL (not the base64 string)
//     });

//     await qrCodeEntry.save();

//     // Respond with the QR code image URL
//     res.status(201).json({
//       message: "QR Code generated and saved successfully",
//       qrCodeUrl,
//       qrCodeEntry,
//     });
//   } catch (error) {
//     console.error("Error generating and saving QR code:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
exports.generateQRCode = async (req, res) => {
  try {
    const {
      numberOfPackets,
      itemsName,
      plantDate,
      cost,
      PickArea,
      Items, // Array of items from the frontend
      Order,
    } = req.body;

    const existingQRCode = await QRCodeModel.findOne({
      "Order.OrderNr": Order.OrderNr,
    });
    if (existingQRCode) {
      return res
        .status(400)
        .json({ message: `OrderNr ${Order.OrderNr} already exists` });
    }

    // Prepare the QR code content
    const qrCodeContent = {
      numberOfPackets,
      itemsName,
      cost,
      qrCodeUrl: `https://tyacoproject-production.up.railway.app/uploads/${Date.now()}.png`,
      PickArea,
      Items, // Include all items as an array
      Order,
    };

    // Format the QR code content as a string with key-value pairs
    const formattedContent = JSON.stringify(qrCodeContent);

    // Generate the QR code and save it to a file
    const qrCodeFileName = `qrcode_${Date.now()}.png`;
    const qrCodeFilePath = path.join(
      __dirname,
      "..",
      "uploads",
      qrCodeFileName
    );

    await QRCode.toFile(qrCodeFilePath, formattedContent, {
      errorCorrectionLevel: "H", // High error correction
    });

    // Load both the QR code and the logo images
    const qrImage = await Jimp.read(qrCodeFilePath);
    const logoImage = await Jimp.read(logoPath);

    // Resize the logo to fit in the center of the QR code (1/5th of the QR code width)
    const qrCodeWidth = qrImage.bitmap.width;
    const logoWidth = qrCodeWidth / 5;
    logoImage.resize(logoWidth, Jimp.AUTO);

    // Position the logo at the center of the QR code
    const xPos = qrImage.bitmap.width / 2 - logoImage.bitmap.width / 2;
    const yPos = qrImage.bitmap.height / 2 - logoImage.bitmap.height / 2;

    // Composite the logo onto the QR code
    qrImage.composite(logoImage, xPos, yPos);

    // Save the final QR code with the logo
    await qrImage.writeAsync(qrCodeFilePath);

    // Save to the database
    const qrCode = new QRCodeModel({
      numberOfPackets,
      itemsName,
      qrCodeUrl: `/uploads/${qrCodeFileName}`,
      plantDate,
      cost,
      PickArea,
      Items,
      Order,
    });
    await qrCode.save();

    // Respond with the QR code details
    res.status(201).json({
      message: "QR Code generated successfully with logo!",
      qrCode,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating QR Code", error });
  }
};

exports.getAllQRCodes = async (req, res) => {
  try {
    const qrCodes = await QRCodeModel.find(); // Fetch all QR codes from the database

    res.status(200).json({
      message: "QR Codes fetched successfully",
      data: qrCodes,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching QR Codes",
      error: error.message,
    });
  }
};
// Update QR Code API
exports.searchItemByNumber = async (req, res) => {
  try {
    const { OrderNr } = req.query; // Get orderId from query parameters

    if (!OrderNr) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    // Find the item in the database by orderId
    const qrCode = await QRCodeModel.findOne({ "Order.OrderNr": OrderNr });

    if (!qrCode) {
      return res
        .status(404)
        .json({ message: "Item not found with this Order ID" });
    }

    // Return the found item
    res.status(200).json({
      message: "Item found",
      qrCode,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error searching for the item", error });
  }
};
