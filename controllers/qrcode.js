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
      numberOfPackets, // Number of packets
      itemsName, // Name of the items
      // Additional details
      trackingId, // Provided from the frontend
      orderId, // Provided from the frontend
      sensitivity, // Sensitivity level
      plantDate, // Date for planting // Cost of the items
      PickArea, // Nested PickArea information
      Item, // Nested Item information
      Order, // Nested Order information
    } = req.body;

    // Prepare the QR code content
    const qrCodeContent = {
      numberOfPackets,
      itemsName,
      trackingId,
      orderId,
      qrCodeUrl: `/qrcodes/qrcode_${Date.now()}.png`, // URL path for the QR code
      sensitivity,
      PickArea, // Include the nested PickArea object
      Item, // Include the nested Item object
      Order, // Include the nested Order object
    };

    // Exclude details if sensitivity is high
    if (sensitivity === "high") {
      delete qrCodeContent.Item;
    } else {
      qrCodeContent.details = Item;
    }

    // Format the QR code content as a string with key-value pairs
    const formattedContent = Object.entries(qrCodeContent)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`) // Stringify nested objects
      .join("\n");

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
      numberOfPackets, // Number of packets
      itemsName, // Name of the items
      // Details based on sensitivity
      qrCodeUrl: qrCodeFileName, // QR code file name
      trackingId, // Tracking ID from frontend
      orderId, // Order ID from frontend
      sensitivity, // Sensitivity level

      plantDate, // Planting date
      // Cost
      PickArea, // Nested PickArea information
      Item: sensitivity === "high" ? undefined : Item, // Nested Item information
      Order, // Nested Order information
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
exports.updateQRCode = async (req, res) => {
  try {
    const { ItemNumber } = req.params; // assuming the request has ItemNumber as a param
    const {
      numberOfPackets,
      itemsName,
      trackingId,
      orderId,
      sensitivity,
      plantDate,
      PickArea, // Nested PickArea info
      Item, // Nested Item info
      Order, // Nested Order info
    } = req.body;

    // Find the QR code entry in the database by ItemNumber
    const qrCode = await QRCodeModel.findOne({ "Item.ItemNumber": ItemNumber });
    if (!qrCode) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Update the QR code details
    qrCode.numberOfPackets = numberOfPackets ?? qrCode.numberOfPackets;
    qrCode.itemsName = itemsName ?? qrCode.itemsName;
    qrCode.trackingId = trackingId ?? qrCode.trackingId;
    qrCode.orderId = orderId ?? qrCode.orderId;
    qrCode.sensitivity = sensitivity ?? qrCode.sensitivity;
    qrCode.plantDate = plantDate ?? qrCode.plantDate;

    // Update nested PickArea
    if (PickArea) {
      qrCode.PickArea = {
        ...qrCode.PickArea, // Keep existing PickArea info
        ...PickArea, // Update with new info
      };
    }

    // Update nested Item
    if (Item) {
      qrCode.Item = {
        ...qrCode.Item, // Keep existing Item info
        ...Item, // Update with new info
      };
    }

    // Update nested Order
    if (Order) {
      qrCode.Order = {
        ...qrCode.Order, // Keep existing Order info
        ...Order, // Update with new info
      };
    }

    if (sensitivity === "high") {
      qrCode.Item = undefined; // Remove details if sensitivity is high
    }

    // Prepare the updated QR code content
    let qrCodeContent = {
      numberOfPackets: qrCode.numberOfPackets,
      itemsName: qrCode.itemsName,
      trackingId: qrCode.trackingId,
      orderId: qrCode.orderId,
      sensitivity: qrCode.sensitivity,
      plantDate: qrCode.plantDate,

      PickArea: qrCode.PickArea, // Include PickArea in QR content
      Item: qrCode.Item, // Include Item in QR content
      Order: qrCode.Order, // Include Order in QR content
    };

    // Format the content into key-value pairs for QR code generation
    const formattedContent = Object.entries(qrCodeContent)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");

    // Define the QR code file path
    const qrCodeFilePath = path.join(
      __dirname,
      "..",
      "uploads",
      qrCode.qrCodeUrl // The same filename as before to overwrite
    );

    // Regenerate the QR code with updated information
    await QRCode.toFile(qrCodeFilePath, formattedContent, {
      errorCorrectionLevel: "H",
    });

    // Load both the QR code and the logo
    const qrImage = await Jimp.read(qrCodeFilePath);
    const logoImage = await Jimp.read(logoPath);

    // Resize the logo to fit in the center of the QR code
    const qrCodeWidth = qrImage.bitmap.width;
    const logoWidth = qrCodeWidth / 5;
    logoImage.resize(logoWidth, Jimp.AUTO);

    // Position the logo at the center of the QR code
    const xPos = qrImage.bitmap.width / 2 - logoImage.bitmap.width / 2;
    const yPos = qrImage.bitmap.height / 2 - logoImage.bitmap.height / 2;

    // Composite the logo onto the QR code
    qrImage.composite(logoImage, xPos, yPos);

    // Overwrite the existing QR code with the logo
    await qrImage.writeAsync(qrCodeFilePath);

    // Save the updated QR code in the database
    await qrCode.save();

    // Respond with the updated QR code details
    res.status(200).json({
      message: "QR Code updated successfully!",
      qrCode,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating QR Code", error });
  }
};
