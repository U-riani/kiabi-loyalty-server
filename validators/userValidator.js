// backend/validators/userValidator.js
import { z } from "zod";

// -----------------------------
// Shared pieces
// -----------------------------

const promoChannelSchema = z.object({
  enabled: z.boolean(),
});

const promoChannelsSchema = z.object({
  sms: promoChannelSchema,
  email: promoChannelSchema,
});

// -----------------------------
// REGISTER SCHEMA
// -----------------------------

export const registerUserSchema = z.object({
  branch: z.enum(["tbilisi", "batumi"]),
  gender: z.enum(["female", "male", "other"]),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // you can improve later with date validation
  address: z.string(),
  city: z.string(),
  country: z.string(),
  email: z.string().email(),
  cardNumber: z.string().min(5),
  phoneCode: z.string().min(1),
  phoneNumber: z.string().min(5),
  termsAccepted: z.literal(true),
  promoChannels: promoChannelsSchema,
});

// -----------------------------
// UPDATE SCHEMA (Partial)
// -----------------------------

export const updateUserSchema = z.object({
  branch: z.enum(["tbilisi", "batumi"]).optional(),
  gender: z.enum(["female", "male", "other"]).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  email: z.string().email().optional(),
  phoneCode: z.string().min(1).optional(),
  phoneNumber: z.string().min(5).optional(),
  promoChannels: z
    .object({
      sms: promoChannelSchema.optional(),
      email: promoChannelSchema.optional(),
    })
    .optional(),
});
