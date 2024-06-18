import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import multer from "multer";
import pkg from "cloudinary";
import streamifier from "streamifier"; // Import streamifier for stream conversion
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
  cloud_name: "dape61ufk",
  api_key: "672517736157678",
  api_secret: "GZO04yBEXAaqs5EjkdPzb37yT5Q",
});
// Multer storage configuration for direct Cloudinary upload
const storage = multer.memoryStorage(); // Use memory storage instead of disk storage

const upload = multer({ storage: storage });

// File upload endpoint
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Convert the buffer to a stream and upload to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder: "images" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ error: "File upload failed" });
        }

        return res.status(200).json({
          message: "File uploaded successfully",
          url: result.secure_url,
        });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
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
