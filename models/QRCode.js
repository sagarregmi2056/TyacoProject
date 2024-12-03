// models/qr.js
const mongoose = require("mongoose");

const qrCodeSchema = new mongoose.Schema(
  {
    numberOfPackets: {
      type: Number,
    },
    itemsName: {
      type: String,
    },
    qrCodeUrl: {
      type: String,
    },
    plantDate: {
      type: Date,
    },

    PickArea: {
      PickAreaNr: {
        type: Number,
      },
      PickAreaName: {
        type: String,
      },
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
