// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    branch: {
      type: String,
      enum: ["tbilisi", "batumi"],
      required: true,
    },
    gender: {
      type: String,
      enum: ["female", "male", "other"],
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    address: String,
    country: String,
    city: String,
    email: String,
    phoneCode: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    cardNumber: { type: String, required: true},
    termsAccepted: { type: Boolean, required: true },
    promoChannels: {
      sms: {
        enabled: { type: Boolean, default: false },
        createdAt: { type: Date, default: null },
        updatedAt: { type: Date, default: null },
      },
      email: {
        enabled: { type: Boolean, default: false },
        createdAt: { type: Date, default: null },
        updatedAt: { type: Date, default: null },
      },
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
