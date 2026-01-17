import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema(
  {
    host_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    session_name: {
      type: String,
      required: true,
    },
    session_code: {
      type: String,
      required: true,
    },
    participants: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    session_status: {
      type: String,
      enum: ["active", "inactive", "halt"],
      default: "inactive",
    },
  },
  {
    timestamps: true,
  }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
