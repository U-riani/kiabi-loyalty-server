// backend/routes/userRoutes.js
import express from "express";
import {
  registerUser,
  updateUser,
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
 *   name: Users
 *   description: Loyalty users management
 */

/**
 * @swagger
 * /apex/register-user:
 *   post:
 *     summary: (Documentation) Payload sent from Loyalty System to Apex ERP
 *     description: |
 *       This endpoint represents the request sent by Loyalty Backend to Apex ERP.
 *       Apex ERP must validate cardNumber and return a status.
 *     tags: [Apex Integration]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApexUserPayload'
 *     responses:
 *       200:
 *         description: Apex validation response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApexResponse'
 */

router.post("/register", registerUser);


//for apex fake endpoint to test integration without hitting real Apex server
router.post("/mock/apex/register-user", (req, res) => {
  const { cardNumber } = req.body;

  if (cardNumber === "00000000000000") {
    return res.json({ status: "CARD_NOT_FOUND" });
  }

  if (cardNumber === "11111111111111") {
    return res.json({ status: "CARD_ALREADY_USED" });
  }

  return res.json({ status: "OK" });
});

router.get("/", getAllUsers);
router.get("/paginated", getPaginatedUsers);
router.get("/by-date", getUsersByDate);
router.get("/by-Update", getUsersByUpdateDate);
router.get("/:id", getUser);
router.patch("/:id", updateUser);

export default router;
