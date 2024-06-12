import express from "express";
import { configDotenv } from "dotenv";
configDotenv();
import bodyParser from "body-parser";
import { join } from "path";
import { connectDB } from "./db/connectdb.js";
import indexLoad from "./middlewares/indexLoad.js";
import errorLoad from "./middlewares/errorLoad.js";
import userRoute from "./routes/userRoute.js";
import adminRoute from "./routes/adminRoute.js";

const app = express();

const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

// database connection
connectDB(DATABASE_URL);

// set files.
app.use(express.static(join(process.cwd(), "public")));

// bodyParser urlencoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// set views directory
app.set("views", "./views");

// middlewares
app.get("/", indexLoad);

// routes reload
app.use("/user", userRoute);
app.use("/admin", adminRoute);

// error middleware
app.use("*", errorLoad);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
