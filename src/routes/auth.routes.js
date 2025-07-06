import express from "espress";
import login from "../controlers/auth.controler";

const router = express.Router();

router.post("/login", login);

export default router;
