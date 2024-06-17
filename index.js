

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import multer from "multer";
import path from "path";
import fs from "fs"; // To handle file system operations
import pkg from "cloudinary";
import { authRoute } from "./routes/auth.js";
import { userRoute } from "./routes/users.js";
import { postRoute } from "./routes/posts.js";

const { v2: cloudinary } = pkg;

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
app.use(
  cors({
    origin: ["http://localhost:5173", "https://facebook-frontend.vercel.app"],
  })
);


app.options("*", cors()); // Enable pre-flight requests for all routes

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage configuration for local storage
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
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = path.join(__dirname, "public/images", req.file.filename);
    console.log("File path:", filePath);

    // Check if file exists before uploading to Cloudinary
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found after upload" });
    }

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
              folder: "images"
    });
    console.log(result.url, "resultresultresultresult");

    // Delete the file from local storage after uploading to Cloudinary
    // fs.unlink(filePath, (err) => {
    //   if (err) console.error("Failed to delete local file:", err);
    // });
    return res
      .status(200)
      .json({ message: "File uploaded successfully", url: result.secure_url });
  } catch (error) {
    console.error("FILE UPLOAD ERROR", error);
    return res.status(500).json({ error: "File upload failed" });
  }
});




// Routes
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/users", userRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
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


