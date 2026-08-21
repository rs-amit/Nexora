import mongoose from "mongoose";

const connectDB = async () => {
  console.log("mongoDB_url", process.env.MONGO_URI)
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: true,
    });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed", error);
    process.exit(1);
  }
};

export default connectDB;
