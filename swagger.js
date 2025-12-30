import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Frontend → Apex Contract",
      version: "1.0.0",
      description:
        "This Swagger documents ONLY the registration payload sent to Apex."
    },
    servers: [
      {
        url: "http://localhost:5000"
      }
    ]
  },
  apis: [path.join(__dirname, "routes", "userRoutes.js")]
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
