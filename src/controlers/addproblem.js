// import Problems from "../models/Problems.js";

// const addProblem = async (req, res) => {
//   const { title } = req.body;
//   try {
//     // Check if the problem already exists
//     const existingProblem = await Problems.findOne({ title });
//     if (existingProblem) {
//       // add 1 to online_now if the problem already exists
//       existingProblem.online_now += 1;
//       await existingProblem.save();
//     } else {
//       // Create a new problem if it doesn't exist
//       const newProblem = new Problems({ title, online_now: 1 });
//       await newProblem.save();
//     }
//   } catch (error) {
//     console.error("Error adding problem:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// export default addProblem;

import Problems from "../models/Problems.js";

const addProblemToDB = async (title) => {
  if (!title) return;

  try {
    const existingProblem = await Problems.findOne({ title });
    if (existingProblem) {
      existingProblem.online_now += 1;
      await existingProblem.save();
    } else {
      const newProblem = new Problems({ title, online_now: 1 });
      await newProblem.save();
    }
  } catch (error) {
    console.error("Error in addProblemToDB:", error);
  }
};

export default addProblemToDB;
