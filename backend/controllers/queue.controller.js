import Session from "../models/session.model.js";
import Queue from "../models/queue.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/ApiError.js";

//add to queue
const addToQueue = asyncHandler(async (requestAnimationFrame, res) => {
  const userId = req.user._id;
  const { session_id, track_id, title, artists, track_image } = req.body;

  const session = await session.findById(session_id);
  const existingTrack = await Queue.findOne({
    session_id,
    track_id,
  });
  if (existingTrack) {
    throw new APIError(400, "Track already in queue");
  }
});

const queueTrack = await Queue.create({
  session_id,
  track_id,
  title,
  artists,
  track_image,
  added_by: userId,
  status: "queued",
  total_votes: 0,
});

//get session playback

const getSessionPlayback = asyncHandler(async (req, res) => {});

export { addToQueue,getSessionPlayback };
