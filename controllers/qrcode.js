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
      details,
      sensitivity,
      pickupLocation,
      plantDate,
      cost,
    } = req.body;

    // Generate unique IDs
    const trackingId = `TRACK-${Date.now()}`;
    const orderId = `ORDER-${Date.now()}`;

    // Prepare the QR code content
    let qrCodeContent = {
      numberOfPackets,
      itemsName,
      trackingId,
      orderId,
      qrCodeUrl: `/qrcodes/qrcode_${Date.now()}.png`,
      sensitivity,
      pickupLocation,
      plantDate,
      cost,
    };

    // Exclude details if sensitivity is high
    if (sensitivity === "high") {
      delete qrCodeContent.details;
    } else {
      qrCodeContent.details = details;
    }

    // Format the QR code content as a string with key-value pairs
    const formattedContent = Object.entries(qrCodeContent)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    // Generate the QR code without saving it to a file yet
    const qrCodeFileName = `qrcode_${Date.now()}.png`;
    const qrCodeFilePath = path.join(
      __dirname,
      "..",
      "uploads",
      qrCodeFileName
    );
    await QRCode.toFile(qrCodeFilePath, formattedContent, {
      errorCorrectionLevel: "H",
    }); // High error correction to allow space for the logo
    console.log("Jimp:", Jimp);

    // Load both the QR code and the logo images
    const qrImage = await Jimp.read(qrCodeFilePath);
    const logoImage = await Jimp.read(logoPath);

    // Resize the logo to fit in the center of the QR code (e.g., 1/5th the width of the QR code)
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
      details: sensitivity === "high" ? undefined : details,
      qrCodeUrl: qrCodeFileName,
      trackingId,
      orderId,
      sensitivity,
      pickupLocation,
      plantDate,
      cost,
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
    // Fetch all QR codes from the database
    const qrCodes = await QRCodeModel.find();

    // Return the fetched QR codes
    res.status(200).json(qrCodes);
  } catch (error) {
    console.error("Error fetching QR codes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
