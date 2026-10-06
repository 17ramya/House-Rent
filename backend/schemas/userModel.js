const mongoose = require("mongoose");
const { useSimpleDb } = require("../config/databaseMode");
const createSimpleModel = require("../db/simpleModel");

const userModel = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    set: function (value) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
  },
  email: {
    type: String,
    required: [true, "email is required"],
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  type: {
    type: String,
    required: [true, "type is required"],
  },
},{
   strict: false,
});

// Locally this is the Mongoose model; on a deployment with no MongoDB it is the
// built-in simple database (see config/databaseMode.js). The name capitalsation
// from the schema above is mirrored so a registered name reads the same in both.
const userSchema = useSimpleDb()
  ? createSimpleModel("users", {
      transform: (data) =>
        typeof data.name === "string" && data.name
          ? { ...data, name: data.name.charAt(0).toUpperCase() + data.name.slice(1) }
          : data,
    })
  : mongoose.model("user", userModel);

module.exports = userSchema;

