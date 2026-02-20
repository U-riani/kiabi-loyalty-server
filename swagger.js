import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverUrl =
  process.env.NODE_ENV === "production"
    ? "https://kiabi-loyalty-server.onrender.com"
    : "http://localhost:5000";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "GTEX ↔ Apex Loyalty Integration API",
      version: "1.0.0",
      description: `
This documentation describes ONLY the integration contract
between GTEX backend and Apex ERP.

It defines:

• What GTEX sends to Apex  
• What Apex must return  
• Expected response formats  

For user identification during update Gtex backend always sends cardNumber as payload property.


Business statuses (OK, CARD_NOT_FOUND, CARD_ALREADY_USED)
must always be returned with HTTP 200.

HTTP status codes other than 200 are reserved for:
- transport errors
- server failures
- unexpected conditions
`,
    },
    servers: [{ url: serverUrl }],
    components: {
      schemas: {
        /* =========================
           APEX REGISTER PAYLOAD
        ========================== */
        UserRegistrationPayload: {
          type: "object",
          required: [
            "branch",
            "gender",
            "firstName",
            "lastName",
            "dateOfBirth",
            "address",
            "country",
            "city",
            "email",
            "cardNumber",
            "phoneCode",
            "phoneNumber",
            "termsAccepted",
            "promoChannels",
          ],
          properties: {
            branch: { type: "string", example: "tbilisi" },
            gender: {
              type: "string",
              enum: ["female", "male", "other"],
              example: "female",
            },
            firstName: { type: "string", example: "Nino" },
            lastName: { type: "string", example: "Beridze" },
            dateOfBirth: {
              type: "string",
              format: "date",
              example: "1995-06-12",
            },
            address: { type: "string", example: "Rustaveli Ave 25" },
            city: { type: "string", example: "Tbilisi" },
            country: { type: "string", example: "Georgia" },
            email: {
              type: "string",
              format: "email",
              example: "nino@gmail.com",
            },
            cardNumber: {
              type: "string",
              description:
                "Normalized loyalty card number. Unique business identifier in Apex. Must exist in Apex and must not be already assigned to another customer.",
              example: "12345678900001",
            },
            phoneCode: { type: "string", example: "+995" },
            phoneNumber: { type: "string", example: "555123456" },
            termsAccepted: { type: "boolean", example: true },
            promoChannels: {
              type: "object",
              required: ["sms", "email"],
              properties: {
                sms: {
                  type: "object",
                  properties: {
                    enabled: { type: "boolean", example: true },
                  },
                },
                email: {
                  type: "object",
                  properties: {
                    enabled: { type: "boolean", example: true },
                  },
                },
              },
            },
          },
        },

        /* =========================
           APEX UPDATE PAYLOAD
        ========================== */
        UpdateUserPayload: {
          type: "object",
          description:
            "Update payload sent to Apex ERP. cardNumber is always included as business identifier. Other fields are included only if modified.",
          required: ["cardNumber"],
          properties: {
            cardNumber: {
              type: "string",
              description:
                "Normalized loyalty card number used by Apex as unique identifier.",
              example: "12345678900001",
            },
            branch: { type: "string" },
            gender: { type: "string", enum: ["female", "male", "other"] },
            firstName: { type: "string" },
            lastName: { type: "string" },
            dateOfBirth: { type: "string", format: "date" },
            address: { type: "string" },
            city: { type: "string" },
            country: { type: "string" },
            email: { type: "string", format: "email" },
            phoneCode: { type: "string" },
            phoneNumber: { type: "string" },
            promoChannels: {
              type: "object",
              properties: {
                sms: {
                  type: "object",
                  properties: { enabled: { type: "boolean" } },
                },
                email: {
                  type: "object",
                  properties: { enabled: { type: "boolean" } },
                },
              },
            },
          },
        },

        /* =========================
           APEX RESPONSE
        ========================== */
        ApexResponse: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["OK", "CARD_NOT_FOUND", "CARD_ALREADY_USED"],
              example: "OK",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2025-01-01T10:00:00Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2025-01-01T10:05:00Z",
            },
            promoChannels: {
              type: "object",
              properties: {
                sms: {
                  type: "object",
                  properties: {
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                  },
                },
                email: {
                  type: "object",
                  properties: {
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
        },

        ErrorResponse: {
          type: "object",
          required: ["success", "code", "message"],
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            code: {
              type: "string",
              example: "INTERNAL_ERROR",
            },
            message: {
              type: "string",
              example: "Something went wrong",
            },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, "routes", "userRoutes.js")],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
