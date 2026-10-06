const mongoose = require("mongoose");
const { useSimpleDb } = require("../config/databaseMode");
const createSimpleModel = require("../db/simpleModel");

const bookingModel = mongoose.Schema(
  {
    propertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "propertyschema",
    },
    ownerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    userName: {
      type: String,
      required: [true, "Please provide a User Name"],
    },
    phone: {
      type: Number,
      required: [true, "Please provide a Phone Number"],
    },
    bookingStatus: {
      type: String,
      required: [true, "Please provide a booking Type"],
    },
  },
  {
    strict: false,
  }
);

// Mongoose locally; the built-in simple database on a deployment with no
// MongoDB (see config/databaseMode.js).
const bookingSchema = useSimpleDb()
  ? createSimpleModel("bookings")
  : mongoose.model("bookingschema", bookingModel);

module.exports = bookingSchema;
