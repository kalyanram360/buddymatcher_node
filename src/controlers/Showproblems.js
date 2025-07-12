import Problems from "../models/Problems.js";

const showProblems = async (req, res) => {
  try {
    const problems = await Problems.find({});
    res.status(200).json(problems);
  } catch (error) {
    console.error("Error fetching problems:", error);
    res.status(500).json({ error: "Failed to fetch problems" });
  }
};

export default showProblems;
