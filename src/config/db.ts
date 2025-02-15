import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoURI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, { dbName: "wafina" });
    console.log("MongoDB Connected!");
  } catch (err) {
    console.error("MongoDB Connection Error: ", err);
  }
};

export default connectDB;