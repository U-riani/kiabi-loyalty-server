// backend/routes/userRoutes.js

import express from "express";
import {
  registerUser,
  registerUserMock,
  updateUser,
  updateUserMock,
  getAllUsers,
  getUser,
  getPaginatedUsers,
  getUsersByDate,
  getUsersByUpdateDate,
} from "../controllers/userController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Apex Integration (Real)
 *     description: Real integration with Apex ERP
 *
 *   - name: Apex Integration (Mock)
 *     description: Mock endpoints simulating Apex ERP responses
 */

/* =======================================================
   🔵 REAL REGISTER (APEX)
======================================================= */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register user (Send data to Apex ERP)
 *     tags: [Apex Integration (Real)]
 *     description: |
 *       Sends normalized user data to Apex ERP.
 *       This endpoint documents ONLY what is sent to Apex
 *       and what is expected in response.
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegistrationPayload'
 *
 *     responses:
 *       200:
 *         description: Apex ERP response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApexResponse'
 *
 *       400:
 *         description: Validation or business error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Card already used
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       502:
 *         description: Apex integration failure
 */
router.post("/register", registerUser);

/* =======================================================
   🟢 MOCK REGISTER
======================================================= */

/**
 * @swagger
 * /api/users/register-mock:
 *   post:
 *     summary: Register user (Mock Apex simulation)
 *     tags: [Apex Integration (Mock)]
 *     description: |
 *       Simulates Apex ERP behavior.
 *
 *       Test card numbers:
 *       - 00000000000000 → CARD_NOT_FOUND
 *       - 11111111111111 → CARD_ALREADY_USED
 *       - Any other → OK
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegistrationPayload'
 *
 *     responses:
 *       200:
 *         description: Mock Apex response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApexResponse'
 *
 *       409:
 *         description: Card already used
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/register-mock", registerUserMock);

/* =======================================================
   🔵 REAL UPDATE (APEX)
======================================================= */

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update user (Send update to Apex ERP)
 *     tags: [Apex Integration (Real)]
 *     description: |
 *       Sends updated user data to Apex ERP.
 *       Only modified fields are included.
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 69981e9c6515f1974f8e40fe
 *         description:
 *          This identifier is used only by GTEX backend.
 *          Apex identifies users by cardNumber.
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserPayload'
 *
 *     responses:
 *       200:
 *         description: Apex ERP response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                success:
 *                  type: boolean
 *                  example: true
 *                user:
 *                  type: object
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       502:
 *         description: Apex integration failure
 */
router.patch("/:id", updateUser);

/* =======================================================
   🟢 MOCK UPDATE
======================================================= */

/**
 * @swagger
 * /api/users/{id}/mock:
 *   patch:
 *     summary: Update user (Mock Apex simulation)
 *     tags: [Apex Integration (Mock)]
 *     description: |
 *       Simulates Apex ERP update response.
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 69981e9c6515f1974f8e40fe
 *         description:
 *          This identifier is used only by GTEX backend.
 *          Apex identifies users by cardNumber.
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserPayload'
 *
 *     responses:
 *       200:
 *         description: Mock Apex response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApexResponse'
 */
router.patch("/:id/mock", updateUserMock);

/* =======================================================
   🔒 INTERNAL ROUTES (NOT DOCUMENTED)
======================================================= */

router.get("/", getAllUsers);
router.get("/paginated", getPaginatedUsers);
router.get("/by-date", getUsersByDate);
router.get("/by-update", getUsersByUpdateDate);
router.get("/:id", getUser);

export default router;
