import express from "express";
import addProblem from "../controlers/addproblem.js";
import removeProblem from "../controlers/removeproblem.comtroler.js";
import showProblems from "../controlers/Showproblems.js";

const router = express.Router();

router.post("/add", addProblem);
router.delete("/remove", removeProblem);
router.get("/show", showProblems);

export default router;
