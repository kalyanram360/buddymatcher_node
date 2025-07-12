import Problems from "../models/Problems.js";

const removeProblem = async (req, res) => {
  const { title } = req.body;
  try {
    // Check if the problem exists
    const existingProblem = await Problems.findOne({ title });
    if (!existingProblem) {
      return res.status(404).json({ message: "Problem not found" });
    } else {
      existingProblem.online_now -= 1;
      await existingProblem.save();
      res.status(200).json({ message: "Problem removed successfully" });
      if (existingProblem.online_now <= 0) {
        await Problems.deleteOne({ title });
        console.log("Problem deleted as online_now is 0");
      }
    }
  } catch (error) {
    console.error("Error removing problem:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default removeProblem;
