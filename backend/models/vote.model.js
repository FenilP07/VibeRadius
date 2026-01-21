import mongoose from "mongoose";
import { Schema } from "mongoose";

const voteSchema = new Schema(
  {
    session_id: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },

    track_id: {
      type: Schema.Types.ObjectId,
      ref: "Queue",
      required: true,
      index: true,
    },

    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

voteSchema.index({ session_id: 1, track_id: 1, user_id: 1 }, { unique: true });

const Vote = mongoose.model("Vote", voteSchema);

export default Vote;
