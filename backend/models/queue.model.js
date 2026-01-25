import mongoose, { Schema } from "mongoose";

const queueSchema = new Schema(
  {
    session_id: {
      type: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
    track_id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    artists: {
      type: [String],
      required: true,
    },
    track_image: {
      type: String,
    },
    added_by: {
      type: String, 
      required: true,
    },
    added_by_name: {
      type: String,
      required: true,
    },
    total_votes: {
      type: Number,
      default: 0,
      index: true,
    },
    status: {
      type: String,
      enum: ["queued", "playing", "played", "skipped"],
      default: "queued",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

queueSchema.index({ session_id: 1, track_id: 1 }, { unique: true });

const Queue = mongoose.model("Queue", queueSchema);
export default Queue;
