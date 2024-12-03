// models/qr.js
const mongoose = require("mongoose");

const qrCodeSchema = new mongoose.Schema(
  {
    Order: {
      OrderNr: {
        type: Number,
        required: true,
      },
    },

    qrCodeUrl: {
      type: String,
    },

    Items: [
      {
        ItemNumber: {
          type: String,
          required: true,
        },
        ItemName: String,
        Packets: Number,
        ItemDescription: {
          type: String,
          required: true,
        },
        plantDate: String,
        PickAreaNr: {
          type: string,
        },
        UOM: {
          type: String,
        },
        SmallText: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("QRCode", qrCodeSchema);
