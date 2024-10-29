import mongoose from "mongoose"

const clickSchema = new mongoose.Schema(
  {
    shortCode: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    browser: {
      type: String,
      default: "unknown",
    },
    os: {
      type: String,
      default: "unknown",
    },
    device: {
      type: String,
      default: "desktop",
    },
    country: {
      type: String,
      default: "unknown",
    },
    city: {
      type: String,
      default: "unknown",
    },
    ip: String,
    referer: {
      type: String,
      default: "direct",
    },
  },
  {
    timestamps: true,
  }
)

// Add indexes for common queries
clickSchema.index({ shortCode: 1, timestamp: -1 })
clickSchema.index({ timestamp: -1 })

export const Click = mongoose.model("CLICK", clickSchema)
