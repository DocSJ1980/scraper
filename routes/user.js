// Imports (express, named imports from userControlller)
import express from "express"
import { login, newUser, forgotPassword, resetPassword, verify } from "../controllers/userController.js"
// import passport from 'passport'
// import { passportAuthenticate } from '../utils/passports.js'
// passportAuthenticate(passport)

// Consts (initializing router)
const router = express.Router()

// Routes (newUser, verify)
router.post("/new", newUser)
router.get("/verify/:e/:vt", verify);
router.post("/login", login)
router.post("/forgotpassword", forgotPassword)
router.post("/restpassword", resetPassword)
// router.get("/protected", passport.authenticate('jwt', { session: false }), protected)

// Export (default)
export default router