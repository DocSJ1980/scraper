// Imports (express, named imports from userControlller)
import express from "express"
import { newUser, verify } from "../controllers/userController.js"

// Consts (initializing router)
const router = express.Router()

// Routes (newUser, verify)
router.post("/new", newUser)
router.get("/verify/:e/:vt", verify);

// Export (default)
export default router