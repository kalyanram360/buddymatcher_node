import mongoose from "mongoose";
const Problems = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  online_now: {
    type: Number,
    default: 1,
  },
});

export default mongoose.model("Problems", Problems);
