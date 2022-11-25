// Imports (express, named imports from simplesControlller)
import express from "express"
import { newSimpleActivity, fetchAllSimpleActivities, updateSimpleActivity, deleteSimpleActivity, batchSimples } from "../controllers/simplesController.js"

// Consts (initializing router)
const router = express.Router()

// User Routes
router.post("/new", newSimpleActivity)
router.get("/fetchlastsimples", fetchAllSimpleActivities)
router.post("/update", updateSimpleActivity)
router.post("/delete", deleteSimpleActivity)
router.post("/batch", batchSimples)

// Export (default)
export default router