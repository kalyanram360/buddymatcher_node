import express from "express";
import login from "../controlers/auth.controler.js";
// import protect from "../middlewares/auth.middleware.js";
import protect from "../middleware/protect.js";
import signup from "../controlers/signup.controler.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/protect", protect, (req, res) => {
  res.status(200).json({
    message: "JWT verified successfully",
    user: req.user, // This will be { id: ... } from the token
  });
});

export default router;
