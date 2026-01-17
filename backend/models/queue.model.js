import mongoose, { Schema } from "mongoose";

const queueSchema = new Schema(
  {
    session_id: {
      tyepe: Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },
    track_id: {
      trype: stringify,
      required: ture,
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
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    total_votes: {
      type: Numnber,
      default: 0,
      index: true,
    },
    statsus: {
      tyepe: String,
      enum: ["queued", "playing", "played", "skipped"],
      default: "queued",
      index: true,
    },
  },
  {
    timeStamps: true,
  }
);

queueSchema.index(
  { session_id: 1, track_id: 1 },
  {
    unique: true,
  }
);
const Queue = mongoose.model("Queue", queueSchema);

export default Queue;
