import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema(
  {
    host_id: {},
    session_name: {
      type: String,
      required: true,
    },
    session_code: {
      type: String,
      required: true,
    },
    participants: {
      type: Number,
      
      default:0
    },
    session_status: {
      type: String,
      enum: ["active", "inactive", "halt"],
      default: "inactive"
    },
  },
  {
    timestamps: true,
  }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
