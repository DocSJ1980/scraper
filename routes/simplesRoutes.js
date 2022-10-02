// Imports (express, named imports from userControlller)
import express from "express"
import { newSimpleActivity, fetchAllSimpleActivities, updateSimpleActivity, deleteSimpleActivity } from "../controllers/simplesController.js"

// Consts (initializing router)
const router = express.Router()

// User Routes
router.post("/new", newSimpleActivity)
router.get("/fetchasimpleactivity", fetchAllSimpleActivities)
router.post("/updatesimpleactivity", updateSimpleActivity)
router.post("/deletesimpleactivity", deleteSimpleActivity)

// Export (default)
export default router