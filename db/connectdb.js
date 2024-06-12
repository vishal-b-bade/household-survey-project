import mongoose from "mongoose";

const connectDB = async (DATABASE_URL) => {
  try {
    // const DB_OPTIONS = {
    //   user: process.env.DB_USER,
    //   pass: process.env.DB_PASS,
    //   dbName: process.env.DB_NAME,
    //   authSource: process.env.DB_AUTH_SOURCE,
    // };
    // await mongoose.connect(DATABASE_URL, DB_OPTIONS);

    const dbUser = process.env.MONGODB_ATLAS_USER;
    const dbPass = process.env.MONGODB_ATLAS_PASS;
    await mongoose.connect(
      `mongodb+srv://${dbUser}:${dbPass}@cluster0.tujtz5z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    );
    console.log("Database Connected..");
  } catch (error) {
    console.log("Error : connectDB :: ", error);
  }
};

export { connectDB };
