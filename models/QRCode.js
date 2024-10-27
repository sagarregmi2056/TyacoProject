// models/qr.js
const mongoose = require("mongoose");

const qrCodeSchema = new mongoose.Schema(
  {
    numberOfPackets: {
      type: Number,
      required: true,
    },
    itemsName: {
      type: String,
      required: true,
    },

    qrCodeUrl: {
      type: String, // This can be used later if you want to store a URL for the QR code image.
    },
    trackingId: {
      type: String,
      required: true,
      unique: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    sensitivity: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
    },

    plantDate: {
      type: Date,
    },
    cost: {
      type: Number,
    },
    // Nested fields for PickArea and Item
    PickArea: {
      PickAreaNr: {
        type: Number,
        required: true,
      },
      PickAreaName: {
        type: String,
        required: true,
      },
    },
    Item: {
      ItemNumber: {
        type: String,
        required: true,
        unique: true,
      },
      ItemDescription: {
        type: String,
        required: true,
      },
      PickAreaNr: {
        type: Number,
        required: true,
      },
      UOM: {
        type: String,
        required: true,
      },
      SmallText: {
        type: String,
      },
    },
    Order: {
      OrderNr: {
        type: Number,
        required: true,
      },
      Quantity: {
        type: Number,
        required: true,
      },
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Export the QRCode model
module.exports = mongoose.model("QRCode", qrCodeSchema);
