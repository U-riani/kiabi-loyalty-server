import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👇 ADD THIS
const serverUrl =
  process.env.NODE_ENV === "production"
    ? "https://kiabi-loyalty-server.onrender.com"
    : "http://localhost:5000";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Loyalty Users API",
      version: "1.0.0",
      description:
        "API for managing loyalty users (registration, updates, queries).",
    },
    // 👇 USE IT HERE
    servers: [
      {
        url: serverUrl,
      },
    ],
  },

  apis: [path.join(__dirname, "routes", "userRoutes.js")],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
