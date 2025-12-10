import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    branch: {
      type: String,
      enum: ["tbilisi", "batumi"],
      required: true,
    },
    gender: String,
    firstName: String,
    lastName: String,
    dateOfBirth: String,
    address: String,
    zipCode: String,
    country: String,
    city: String,
    email: String,
    phone: String,
    cardNumber: String,
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
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
