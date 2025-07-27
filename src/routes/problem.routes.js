import express from "express";
import addProblem from "../controlers/addproblem.js";
import removeProblem from "../controlers/removeproblem.comtroler.js";
import showProblems from "../controlers/Showproblems.js";
import user_data from "../controlers/return_userdata.js";

const router = express.Router();

router.post("/add", addProblem);
router.delete("/remove", removeProblem);
router.get("/show", showProblems);
router.get("/user/:username", user_data);

export default router;
