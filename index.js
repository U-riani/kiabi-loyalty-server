// 1) Load env FIRST
console.log("🔥 THIS INDEX.JS IS RUNNING 🔥");

import dotenv from "dotenv";
dotenv.config();

// 2) Import core dependencies
import express from "express";
import cors from "cors";
// import mongoose from "mongoose";
import connectDB from "./config/db.js";
import smsRoutes from "./routes/smsRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// 5) Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.log("MongoDB error:", err));

// // 6) Import routes AFTER dotenv is loaded
// import smsRoutes from "./routes/smsRoutes.js";
// import userRoutes from "./routes/userRoutes.js";

// 7) Use routes
app.use("/api/sms", smsRoutes);
app.use("/api/users", userRoutes);

app.use("/api-docs", swaggerUi.serve);
app.get("/api-docs", swaggerUi.setup(swaggerSpec));
app.get("/__swagger-test", (req, res) => {
  res.json(swaggerSpec);
});

app.get("/", (req, res) => {
  try {
    res.json({ message: "title" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// // FIX: server starts ONLY after Mongo connects
// const startServer = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI, {
//       serverSelectionTimeoutMS: 5000, // optional but recommended
//     });

//     console.log("MongoDB connected");

//     app.listen(process.env.PORT, () => {
//       console.log(`Server running on port ${process.env.PORT}`);
//     });
//   } catch (err) {
//     console.error("MongoDB connection failed:", err.message);
//   }
// };

// startServer();
