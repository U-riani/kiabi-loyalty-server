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
      description: "API for managing loyalty users and syncing with Apex ERP.",
    },
    servers: [{ url: serverUrl }],
    components: {
      schemas: {
        ApexUserPayload: {
          type: "object",
          properties: {
            branch: { type: "string", example: "tbilisi" },
            gender: { type: "string", example: "female" },
            firstName: { type: "string", example: "Nino" },
            lastName: { type: "string", example: "Beridze" },
            dateOfBirth: { type: "string", example: "1995-06-12" },
            address: { type: "string", example: "Rustaveli Ave 25" },
            city: { type: "string", example: "Tbilisi" },
            country: { type: "string", example: "Georgia" },
            email: { type: "string", example: "nino@gmail.com" },
            cardNumber: {
              type: "string",
              description: "Normalized card number (without '-' and spaces)",
              example: "12345678900001",
            },
            phoneCode: { type: "string", example: "+995" },
            phoneNumber: { type: "string", example: "555123456" },
            termsAccepted: { type: "boolean", example: true },
            promoChannels: {
              type: "object",
              properties: {
                sms: {
                  type: "object",
                  properties: {
                    enabled: { type: "boolean", example: true },
                    createdAt: {
                      type: "string",
                      example: "2025-01-01T10:00:00Z",
                    },
                    updatedAt: {
                      type: "string",
                      example: "2025-01-01T10:00:00Z",
                    },
                  },
                },
                email: {
                  type: "object",
                  properties: {
                    enabled: { type: "boolean", example: true },
                    createdAt: {
                      type: "string",
                      example: "2025-01-01T10:00:00Z",
                    },
                    updatedAt: {
                      type: "string",
                      example: "2025-01-01T10:00:00Z",
                    },
                  },
                },
              },
            },
          },
        },
        ApexResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: ["OK", "CARD_NOT_FOUND", "CARD_ALREADY_USED"],
              example: "OK",
            },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, "routes", "userRoutes.js")],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
