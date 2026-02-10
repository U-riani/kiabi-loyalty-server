// controllers/smsCOntroller.js
import { SMS } from "@gosmsge/gosmsge-node";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
import crypto from "crypto";
import Otp from "../models/Otp.js";
if (!process.env.GOSMS_API_KEY) {
  throw new Error("GOSMS_API_KEY is missing");
}

const sms = new SMS(process.env.GOSMS_API_KEY);
const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

export const sendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const normalizedPhone = String(phoneNumber || "").trim();

    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        error: "Phone number required",
      });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    await Otp.findOneAndUpdate(
      { phoneNumber: normalizedPhone },
      {
        otpHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
      { upsert: true, new: true }
    );

    await sms.send(
      normalizedPhone,
      `Your verification code is: 
${otp}
Please read Terms & Conditions:
https://kiabi-loyalty.netlify.app/terms-and-conditions`,
      "UniStep"
    );

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;
    const normalizedPhone = String(phoneNumber || "").trim();

    if (!normalizedPhone || !code) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const record = await Otp.findOne({ phoneNumber: normalizedPhone });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Code expired or not found",
      });
    }

    if (Date.now() > record.expiresAt.getTime()) {
      await Otp.deleteOne({ phoneNumber: normalizedPhone });
      return res.status(400).json({
        success: false,
        message: "Code expired",
      });
    }

    const isValid = hashOtp(code) === record.otpHash;

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid code",
      });
    }

    await Otp.deleteOne({ phoneNumber: normalizedPhone });

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};

export const createSender = async (req, res) => {
  try {
    const result = await sms.createSender("MyCompany");
    return res.json({
      success: true,
      result,
    });
  } catch (err) {
    console.log("Error:", err.message);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
