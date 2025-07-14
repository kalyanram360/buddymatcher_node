// import mongoose from "mongoose";
// const Problems = new mongoose.Schema({
//   title: {
//     type: String,
//     required: true,
//   },
//   online_now: {
//     type: Number,
//     default: 1,
//   },
// });

// export default mongoose.model("Problems", Problems);

import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 200,
  },
  online_now: {
    type: Number,
    default: 0,
    min: 0,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Update the updated_at field before saving
problemSchema.pre("save", function (next) {
  this.updated_at = Date.now();
  next();
});

// Index for faster queries
problemSchema.index({ online_now: -1 });
problemSchema.index({ title: 1 });

const Problems = mongoose.model("Problems", problemSchema);

export default Problems;
