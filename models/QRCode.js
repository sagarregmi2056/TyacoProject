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
      type: String,
    },
    plantDate: {
      type: Date,
    },
    cost: {
      type: Number,
    },
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
    Items: [
      {
        ItemNumber: {
          type: String,
          required: true,
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
    ],
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
  { timestamps: true }
);

module.exports = mongoose.model("QRCode", qrCodeSchema);
