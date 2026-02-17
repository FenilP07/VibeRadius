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
      type: [Object],
      required: true,
    },
    track_image: {
      type: String,
    },
    added_by_id: {
      type: String,
      required: true,
    },
    added_by_name: {
      type: String,
    },
    total_votes: {
      type: Number,
      default: 0,
      index: -1,
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

queueSchema.index(
  { session_id: 1, track_id: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["queued", "playing"] } },
  }
);
queueSchema.index({ session_id: 1, status: 1, total_votes: -1 });

const Queue = mongoose.model("Queue", queueSchema);
export default Queue;
