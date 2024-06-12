import mongoose from "mongoose";

// Defining Schema.
const PeopleSchema = new mongoose.Schema({
  familyId: {
    type: Number,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  relation: {
    type: String,
    required: true,
    trim: true,
  },
  mobileNo: {
    type: Number,
  },
  abha: {
    type: Number,
  },
  ayushman: {
    type: Number,
  },
});

export default mongoose.model("People", PeopleSchema);
