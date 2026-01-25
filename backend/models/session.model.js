import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema(
  {
    host_id: {
      type: Schema.Types.ObjectId,
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
      unique: true,
      uppercase: true,
    },
    participants: [
      {
        id: { type: String, required: true }, 
        name: { type: String, required: true }, 
      },
    ],
    session_status: {
      type: String,
      enum: ["active", "inactive", "halt"],
      default: "inactive",
    },
    current_track_id: {
      type: Schema.Types.ObjectId,
      ref: "Queue",
      default: null,
    },
  },
  { timestamps: true }
);

sessionSchema.index({ host_id: 1, createdAt: -1 });

const Session = mongoose.model("Session", sessionSchema);
export default Session;
