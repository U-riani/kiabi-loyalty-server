// backend/controllers/userController.js

import User from "../models/User.js";
import { registerInApex, updateInApex } from "../services/apexService.js";
import {
  registerUserSchema,
  updateUserSchema,
} from "../validators/userValidator.js";

export const registerUser = async (req, res) => {
  try {
    // -----------------------------
    // 1️⃣ Validate input
    // -----------------------------
    const parsed = registerUserSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: parsed.error.errors,
      });
    }

    const input = parsed.data;

    // -----------------------------
    // 2️⃣ Normalize card number
    // -----------------------------
    const normalizedCard = input.cardNumber
      .replace(/-/g, "")
      .replace(/\s/g, "")
      .trim();

    const data = {
      branch: input.branch,
      gender: input.gender,
      firstName: input.firstName,
      lastName: input.lastName,
      dateOfBirth: input.dateOfBirth,
      address: input.address || "",
      city: input.city || "",
      country: input.country || "",
      email: input.email || "",
      cardNumber: normalizedCard,
      phoneCode: input.phoneCode,
      phoneNumber: input.phoneNumber,
      termsAccepted: input.termsAccepted,
      promoChannels: {
        sms: {
          enabled: input.promoChannels?.sms?.enabled ?? false,
        },
        email: {
          enabled: input.promoChannels?.email?.enabled ?? false,
        },
      },
    };

    if (process.env.NODE_ENV !== "production") {
      console.log("Registration payload:", data);
    }
    // -----------------------------
    // 3️⃣ Call Apex Service
    // -----------------------------
    const apexResult = await registerInApex(data);

    // -----------------------------
    // 4️⃣ Handle Apex business result
    // -----------------------------
    if (apexResult.status === "CARD_NOT_FOUND") {
      return res.status(400).json({
        success: false,
        code: "CARD_NOT_FOUND",
        message: "Card does not exist",
      });
    }

    if (apexResult.status === "CARD_ALREADY_USED") {
      return res.status(409).json({
        success: false,
        code: "CARD_ALREADY_USED",
        message: "Card already used",
      });
    }

    if (apexResult.status !== "OK") {
      return res.status(502).json({
        success: false,
        code: "APEX_UNEXPECTED_RESPONSE",
        message: "Unexpected response from Apex",
      });
    }

    // -----------------------------
    // 5️⃣ Save to MongoDB
    // -----------------------------
    const user = new User({
      ...data,
      createdAt: apexResult.createdAt
        ? new Date(apexResult.createdAt)
        : undefined,
      updatedAt: apexResult.updatedAt
        ? new Date(apexResult.updatedAt)
        : undefined,

      promoChannels: {
        sms: {
          enabled: data.promoChannels.sms.enabled,
          createdAt: apexResult.promoChannels?.sms?.createdAt
            ? new Date(apexResult.promoChannels.sms.createdAt)
            : null,
          updatedAt: apexResult.promoChannels?.sms?.updatedAt
            ? new Date(apexResult.promoChannels.sms.updatedAt)
            : null,
        },
        email: {
          enabled: data.promoChannels.email.enabled,
          createdAt: apexResult.promoChannels?.email?.createdAt
            ? new Date(apexResult.promoChannels.email.createdAt)
            : null,
          updatedAt: apexResult.promoChannels?.email?.updatedAt
            ? new Date(apexResult.promoChannels.email.updatedAt)
            : null,
        },
      },
    });
    await user.save();

    return res.status(200).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (err) {
    console.error("Registration error:", err);

    // -----------------------------
    // 6️⃣ Map Service Errors
    // -----------------------------
    if (err.code === "CONFIG_ERROR") {
      return res.status(500).json({
        success: false,
        code: "CONFIG_ERROR",
        message: "Apex endpoint not configured",
      });
    }

    if (err.code === "APEX_TIMEOUT") {
      return res.status(504).json({
        success: false,
        code: "APEX_TIMEOUT",
        message: "Apex server timeout",
      });
    }

    if (err.code === "APEX_HTTP_ERROR") {
      return res.status(502).json({
        success: false,
        code: "APEX_HTTP_ERROR",
        message: "Apex server returned HTTP error",
      });
    }

    if (err.code === "APEX_INVALID_RESPONSE") {
      return res.status(502).json({
        success: false,
        code: "APEX_INVALID_RESPONSE",
        message: "Invalid response from Apex",
      });
    }

    if (err.code === "APEX_NETWORK_ERROR") {
      return res.status(502).json({
        success: false,
        code: "APEX_NETWORK_ERROR",
        message: "Apex server unreachable",
      });
    }

    if (err.code === "APEX_UNKNOWN_ERROR") {
      return res.status(502).json({
        success: false,
        code: "APEX_UNKNOWN_ERROR",
        message: "Unexpected Apex integration error",
      });
    }

    return res.status(500).json({
      success: false,
      code: "INTERNAL_ERROR",
      message: "Registration failed",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-__v");

    return res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-__v");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Failed to fetch user",
      message: err.message,
    });
  }
};

export const getPaginatedUsers = async (req, res) => {
  try {
    // page=1, limit=20 are defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // how many to skip
    const skip = (page - 1) * limit;

    const users = await User.find()
      .sort({ createdAt: -1 }) // newest first (optional)
      .skip(skip)
      .limit(limit)
      .select("-__v");

    const total = await User.countDocuments();

    return res.json({
      success: true,
      page,
      limit,
      totalUsers: total,
      totalPages: Math.ceil(total / limit),
      users,
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Failed to fetch users", message: err.message });
  }
};

export const getUsersByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: "Date is required (YYYY-MM-DD)",
      });
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const users = await User.find({
      createdAt: { $gte: start, $lte: end },
    })
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.json({
      success: true,
      date,
      count: users.length,
      users,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const getUsersByUpdateDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: "Date is required (YYYY-MM-DD)",
      });
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const users = await User.find({
      updatedAt: { $gte: start, $lte: end },
    })
      .sort({ updatedAt: -1 })
      .select("-__v");

    return res.json({
      success: true,
      date,
      count: users.length,
      users,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const parsed = updateUserSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: parsed.error.errors,
      });
    }

    const input = parsed.data;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const editableFields = [
      "branch",
      "gender",
      "firstName",
      "lastName",
      "dateOfBirth",
      "address",
      "country",
      "city",
      "email",
      "phoneNumber",
      "phoneCode",
    ];

    // -----------------------------
    // 1️⃣ BUILD APEX PAYLOAD ONLY
    // -----------------------------
    const apexPayload = {
      cardNumber: user.cardNumber, // identifier required
    };

    editableFields.forEach((field) => {
      if (input[field] !== undefined) {
        apexPayload[field] = input[field];
      }
    });

    if (input.promoChannels) {
      apexPayload.promoChannels = {};

      if (input.promoChannels.sms?.enabled !== undefined) {
        apexPayload.promoChannels.sms = {
          enabled: input.promoChannels.sms.enabled,
        };
      }

      if (input.promoChannels.email?.enabled !== undefined) {
        apexPayload.promoChannels.email = {
          enabled: input.promoChannels.email.enabled,
        };
      }
    }

    // -----------------------------
    // 2️⃣ SEND TO APEX FIRST
    // -----------------------------
    const apexResult = await updateInApex(apexPayload);

    if (!apexResult || apexResult.status !== "OK") {
      return res.status(502).json({
        success: false,
        code: "APEX_UPDATE_FAILED",
        message: `Apex update failed: ${apexResult?.status}`,
      });
    }

    // -----------------------------
    // 3️⃣ APPLY CHANGES TO MONGO
    // -----------------------------
    editableFields.forEach((field) => {
      if (input[field] !== undefined) {
        user[field] = input[field];
      }
    });

    if (input.promoChannels) {
      if (input.promoChannels.sms?.enabled !== undefined) {
        user.promoChannels.sms.enabled = input.promoChannels.sms.enabled;
      }

      if (input.promoChannels.email?.enabled !== undefined) {
        user.promoChannels.email.enabled = input.promoChannels.email.enabled;
      }
    }

    // -----------------------------
    // 4️⃣ SYNC TIMESTAMPS FROM APEX
    // -----------------------------
    if (apexResult.updatedAt) {
      user.updatedAt = new Date(apexResult.updatedAt);
    }

    if (apexResult.promoChannels?.sms) {
      if (apexResult.promoChannels.sms.createdAt) {
        user.promoChannels.sms.createdAt = new Date(
          apexResult.promoChannels.sms.createdAt,
        );
      }

      if (apexResult.promoChannels.sms.updatedAt) {
        user.promoChannels.sms.updatedAt = new Date(
          apexResult.promoChannels.sms.updatedAt,
        );
      }
    }

    if (apexResult.promoChannels?.email) {
      if (apexResult.promoChannels.email.createdAt) {
        user.promoChannels.email.createdAt = new Date(
          apexResult.promoChannels.email.createdAt,
        );
      }

      if (apexResult.promoChannels.email.updatedAt) {
        user.promoChannels.email.updatedAt = new Date(
          apexResult.promoChannels.email.updatedAt,
        );
      }
    }

    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    console.log(err);

    if (err.code === "CONFIG_ERROR") {
      return res.status(500).json({
        success: false,
        code: "CONFIG_ERROR",
        message: "Apex update endpoint not configured",
      });
    }

    if (err.code === "APEX_TIMEOUT") {
      return res.status(504).json({
        success: false,
        code: "APEX_TIMEOUT",
        message: "Apex server timeout",
      });
    }

    if (err.code === "APEX_HTTP_ERROR") {
      return res.status(502).json({
        success: false,
        code: "APEX_HTTP_ERROR",
        message: "Apex server returned HTTP error",
      });
    }

    if (err.code === "APEX_INVALID_RESPONSE") {
      return res.status(502).json({
        success: false,
        code: "APEX_INVALID_RESPONSE",
        message: "Invalid response from Apex",
      });
    }

    if (err.code === "APEX_NETWORK_ERROR") {
      return res.status(502).json({
        success: false,
        code: "APEX_NETWORK_ERROR",
        message: "Apex server unreachable",
      });
    }

    if (err.code === "APEX_UNKNOWN_ERROR") {
      return res.status(502).json({
        success: false,
        code: "APEX_UNKNOWN_ERROR",
        message: "Unexpected Apex update error",
      });
    }

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        code: "CARD_ALREADY_EXISTS_LOCALLY",
        message: "User already exists in local database",
      });
    }

    return res.status(500).json({
      success: false,
      code: "INTERNAL_ERROR",
      message: "Update failed",
    });
  }
};

export const registerUserMock = async (req, res) => {
  try {
    const parsed = registerUserSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: parsed.error.errors,
      });
    }

    const input = parsed.data;

    const normalizedCard = input.cardNumber
      .replace(/-/g, "")
      .replace(/\s/g, "")
      .trim();

    // ---- MOCK BUSINESS LOGIC ----
    if (normalizedCard === "00000000000000") {
      return res.status(400).json({
        success: false,
        code: "CARD_NOT_FOUND",
        message: "Card does not exist",
      });
    }

    if (normalizedCard === "11111111111111") {
      return res.status(409).json({
        success: false,
        code: "CARD_ALREADY_USED",
        message: "Card already used",
      });
    }

    // ---- SIMULATE APEX RESPONSE ----
    const now = new Date();

    const mockApexResponse = {
      status: "OK",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      promoChannels: {
        sms: {
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
        email: {
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        },
      },
    };

    // ---- SAVE SAME WAY AS REAL FLOW ----
    const user = new User({
      ...input,
      cardNumber: normalizedCard,
      createdAt: new Date(mockApexResponse.createdAt),
      updatedAt: new Date(mockApexResponse.updatedAt),
      promoChannels: {
        sms: {
          enabled: input.promoChannels?.sms?.enabled ?? false,
          createdAt: new Date(mockApexResponse.promoChannels.sms.createdAt),
          updatedAt: new Date(mockApexResponse.promoChannels.sms.updatedAt),
        },
        email: {
          enabled: input.promoChannels?.email?.enabled ?? false,
          createdAt: new Date(mockApexResponse.promoChannels.email.createdAt),
          updatedAt: new Date(mockApexResponse.promoChannels.email.updatedAt),
        },
      },
    });

    await user.save();

    return res.json({
      success: true,
      message: "User registered (MOCK)",
      user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_ERROR",
      message: "Mock registration failed",
    });
  }
};

export const updateUserMock = async (req, res) => {
  try {
    const { id } = req.params;

    const parsed = updateUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        code: "VALIDATION_ERROR",
        message: parsed.error.errors,
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const input = parsed.data;

    // ---- APPLY CHANGES ----
    const allowedFields = [
      "branch",
      "gender",
      "firstName",
      "lastName",
      "dateOfBirth",
      "address",
      "country",
      "city",
      "email",
      "phoneNumber",
      "phoneCode",
    ];

    allowedFields.forEach((field) => {
      if (input[field] !== undefined) {
        user[field] = input[field];
      }
    });

    const now = new Date();

    // ---- SIMULATE APEX TIMESTAMP SYNC ----
    if (input.promoChannels?.sms?.enabled !== undefined) {
      user.promoChannels.sms.enabled = input.promoChannels.sms.enabled;
      user.promoChannels.sms.updatedAt = now;
      if (!user.promoChannels.sms.createdAt) {
        user.promoChannels.sms.createdAt = now;
      }
    }

    if (input.promoChannels?.email?.enabled !== undefined) {
      user.promoChannels.email.enabled = input.promoChannels.email.enabled;
      user.promoChannels.email.updatedAt = now;
      if (!user.promoChannels.email.createdAt) {
        user.promoChannels.email.createdAt = now;
      }
    }

    user.updatedAt = now;

    await user.save();

    return res.json({
      success: true,
      message: "User updated (MOCK)",
      user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      code: "INTERNAL_ERROR",
      message: "Mock update failed",
    });
  }
};
