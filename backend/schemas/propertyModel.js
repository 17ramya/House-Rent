const mongoose = require('mongoose')
const { useSimpleDb } = require('../config/databaseMode')
const createSimpleModel = require('../db/simpleModel')

const propertyModel = mongoose.Schema({
   ownerId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
   },
   propertyType:{
      type:String,
      required:[true,'Please provide a Property Type']
   },
   propertyAdType:{
      type: String,
      required:[true,'Please provide a Property Ad Type']
   },
   propertyAddress:{
      type: String,
      required:[true,"Please Provide an Address"]
   },
   ownerContact:{
      type: Number,
      required: [true, 'Please provide owner contact']
   },
   propertyAmt:{
      type :Number ,
      default: 0,
   },
   propertyImage: {
      type: Object
   },
   additionalInfo:{
      type: String,
   },
   ownerName: {
      type: String,
   }
},{
   strict: false,
})

// Mongoose locally; the built-in simple database on a deployment with no
// MongoDB (see config/databaseMode.js).
const propertySchema = useSimpleDb()
  ? createSimpleModel('propertschemas')
  : mongoose.model('propertyschema', propertyModel)

module.exports = propertySchema