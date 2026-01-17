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
      unique: true,
      uppercase: true,
    },
    participants: [
      {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        joined_at: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["active", "inactive", "left", "kicked"],
          default: "active",
        },
      },
    ],
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

sessionSchema.index({ session_code: 1 });
sessionSchema.index({ host_id: 1, createdAt: -1 });

const Session = mongoose.model("Session", sessionSchema);

export default Session;
