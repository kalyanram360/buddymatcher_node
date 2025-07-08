import express from "express";
import login from "../controlers/auth.controler.js";
// import protect from "../middlewares/auth.middleware.js";
import protect from "../middleware/protect.js";

const router = express.Router();

router.post("/login", login);
router.get("/protect", protect);

export default router;
