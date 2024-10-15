const mongoose = require("mongoose");

const qrCodeSchema = new mongoose.Schema(
  {
    numberOfPackets: {
      type: Number,
      required: true,
    },
    details: {
      type: String,
      required: function () {
        return this.sensitivity !== "high"; // Only require if sensitivity is not high
      },
    },
    qrCodeUrl: {
      type: String, // URL for the QR code image.
    },
    trackingId: {
      type: String, // Tracking ID for the order
      required: true,
      unique: true, // Ensure tracking IDs are unique
    },
    orderId: {
      type: String, // Order ID for the order
      required: true,
      unique: true, // Ensure order IDs are unique
    },
    itemsName: {
      type: String,
      required: true, // This can be made required based on your business logic
    },
    sensitivity: {
      type: String,
      enum: ["high", "medium", "low"],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("QRCode", qrCodeSchema);
