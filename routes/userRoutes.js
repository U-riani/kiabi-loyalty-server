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
 * /api/users/register:
 *   post:
 *     summary: Register loyalty user (Frontend → Apex)
 *     description: >
 *       Triggered after user submits the registration form
 *       and phone number is successfully verified.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gender
 *               - firstName
 *               - lastName
 *               - dateOfBirth
 *               - address
 *               - country
 *               - city
 *               - cardNumber
 *               - phoneNumber
 *               - termsAccepted
 *             properties:
 *               gender:
 *                 type: string
 *                 enum: [female, male, other]
 *               firstName:
 *                 type: string
 *                 example: "Nino"
 *               lastName:
 *                 type: string
 *                 example: "Beridze"
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1995-06-12"
 *               address:
 *                 type: string
 *                 example: "Rustaveli Ave 25"
 *               country:
 *                 type: string
 *                 example: "Georgia"
 *               city:
 *                 type: string
 *                 example: "Tbilisi"
 *               email:
 *                 type: string
 *                 nullable: true
 *                 example: "nino.beridze@gmail.com"
 *               cardNumber:
 *                 type: string
 *                 example: "123-456-789-00001"
 *               phoneNumber:
 *                 type: string
 *                 example: "995555123456"
 *               promotionChanel1:
 *                 type: boolean
 *                 example: true
 *               promotionChanel2:
 *                 type: boolean
 *                 example: true
 *               termsAccepted:
 *                 type: boolean
 *                 example: true
 *               branch:
 *                 type: string
 *                 example: "tbilisi"
 *     responses:
 *       200:
 *         description: User registered and forwarded to Apex
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Validation error
 */
router.post("/register", registerUser);

router.get("/", getAllUsers);
router.get("/paginated", getPaginatedUsers);
router.get("/by-date", getUsersByDate);
router.get("/by-Update", getUsersByUpdateDate);
router.get("/:id", getUser);
router.patch("/:id", updateUser);

export default router;
