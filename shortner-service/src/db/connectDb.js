import mongoose from "mongoose"

const connectDb = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/url-shortner`)
  } catch (error) {
    console.log("Error Connecting to DB: ", error)
    process.exit(1)
  }
}

export default connectDb
