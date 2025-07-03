import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  username: String,
  Fullname: String,
  email: String,
  password: String,
  Friends: {
    type: [String],
    default: [],
  },
});

// 🔐 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // only hash if changed
  const salt = await bcrypt.genSalt(10); // 10 = salt rounds
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔍 Compare entered password with stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
