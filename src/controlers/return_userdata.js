import user from "../models/users.js";

const user_data = async (req, res) => {
  const username = req.params.username;
  const user1 = await user.findOne({ username });
  if (!user1) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user1);
};

export default user_data;
