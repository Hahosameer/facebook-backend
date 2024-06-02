import express from "express";
import cors from "cors"; // Import cors middleware
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import { authRoute } from "./routes/auth.js";
import { userRoute } from "./routes/users.js";
import { postRoute } from "./routes/posts.js";
import multer from "multer";
import path from "path";

dotenv.config();

const app = express();

// Database connection
const DBConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connected");
  } catch (err) {
    console.error("Database connection error:", err);
    process.exit(1);
  }
};

DBConnection();

// Static file serving
const __dirname = path.resolve();
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
// app.use(cors()); // Enable CORS
// app.options('*', cors()); 

app.use(
  cors({
    origin: "https://facebook-frontend.vercel.app" 
  })
);

// Allow pre-flight requests
// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});
const upload = multer({ storage: storage });

// File upload endpoint
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    return res.status(200).json("File uploaded successfully");
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "File upload failed" });
  }
});

// Routes
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/users", userRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend Server is running on port ${PORT}`);
});
