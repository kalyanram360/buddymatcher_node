// import express from "express";
// import addProblem from "../controlers/addproblem.js";
// import removeProblem from "../controlers/removeproblem.comtroler.js";
// import showProblems from "../controlers/Showproblems.js";

// const router = express.Router();

// router.post("/add", addProblem);
// router.delete("/remove", removeProblem);
// router.get("/show", showProblems);

// export default router;

import express from "express";
import {
  addProblem,
  removeProblem,
  updateProblemCount,
  removeAllFromProblem,
  showProblems,
  getProblem,
  cleanupProblems,
} from "../controlers/allproblemControlers.js";

const router = express.Router();

// GET /problems/show - Get all problems
router.get("/show", showProblems);

// GET /problems/:title - Get specific problem
router.get("/:title", getProblem);

// POST /problems/add - Add new problem or increment count
router.post("/add", addProblem);

// POST /problems/remove - Remove one user from problem
router.post("/remove", removeProblem);

// POST /problems/update-count - Update problem count to specific value
router.post("/update-count", updateProblemCount);

// POST /problems/remove-all - Remove all users from problem (delete problem)
router.post("/remove-all", removeAllFromProblem);

// POST /problems/cleanup - Clean up problems with 0 users
router.post("/cleanup", cleanupProblems);

export default router;
