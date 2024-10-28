import mongoose from "mongoose"

const clickSchema = new mongoose.Schema({
  shortCode: {
    type: String,
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  country: String,
  city: String,
  device: String,
  browser: String,
  os: String,
  ip: String,
  referer: String,
})

export const Click = mongoose.model("CLICK", clickSchema)
