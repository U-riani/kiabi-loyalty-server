// backend/index.js

import dotenv from "dotenv";
dotenv.config();

// 2) Core deps
import express from "express";
import cors from "cors";

// DB + routes
import connectDB from "./config/db.js";
import smsRoutes from "./routes/smsRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Swagger
import swaggerUi from "swagger-ui-express";
import swaggerUiDist from "swagger-ui-dist";
import { swaggerSpec } from "./swagger.js";

// --------------------
// APP INIT
// --------------------
const app = express();
const allowedOrigins = [
  "https://kiabi-loyalty.netlify.app",
  "http://localhost:5173",
  "http://localhost:5000/api-docs",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow server-to-server & tools like Postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// VERY IMPORTANT for preflight
app.options("*", cors());
app.use(express.json());

// --------------------
// DB
// --------------------
connectDB();

// --------------------
// ROUTES
// --------------------
app.use("/api/sms", smsRoutes);
app.use("/api/users", userRoutes);

// --------------------
// SWAGGER (THIS IS THE FIX)
// --------------------
app.use("/api-docs", swaggerUi.serve);
app.get("/api-docs", swaggerUi.setup(swaggerSpec));

// Optional debug
app.get("/__swagger-test", (req, res) => {
  res.json(swaggerSpec);
});
// --------------------
// ROOT
// --------------------
app.get("/", (req, res) => {
  res.json({ message: "title" });
});

// --------------------
// SERVER
// --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
