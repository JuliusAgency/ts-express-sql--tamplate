import mongoose from "mongoose";

const DEFAULT_LOCAL_MONGO_URI = "mongodb://localhost:27017";

export async function initializeMongo() {
  const uri = process.env.MONGO_URI || DEFAULT_LOCAL_MONGO_URI;

  try {
    await mongoose.connect(uri);
    console.log("Connected to Mongo");
  } catch (error) {
    console.log(error);
  }
}
