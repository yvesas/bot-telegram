import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export class Database {
  public async connect(): Promise<void> {
    try {
      await mongoose.connect(process.env.DB_CONNECT as string, {
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
      });
      console.log("✅ Connected to MongoDB Atlas");
    } catch (err) {
      console.error("❌ Error connecting to MongoDB:", err);
    }
  }
}
