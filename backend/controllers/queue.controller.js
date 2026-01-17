import Session from "../models/session.model.js";
import Queue from "../models/queue.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/ApiError.js";
import { APIResponse } from "../utils/ApiResponse.js";
//add to queue
const addToQueue = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { session_id, track_id, title, artists, track_image } = req.body;

  const session = await Session.findById(session_id);
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

const getSessionPlayback = asyncHandler(async (req, res) => {
  const { session_id } = req.params;

  const sesssion = await Session.findById(session_id).populate({
    path: "current_track_id",
    populate: {
      path: "added_by",
      select: "name",
    },
  });

  const queue = await Queue.find({
    session_id: session_id,
    status: "queued",
  })
    .sort({
      total_votes: -1,
      createdAt: 1,
    })
    .populate("added_by");

  return res.status(200).json(
    new APIResponse(
      200,
      {
        current_track: sesssion.current_track_id,
        queue,
      },
      "Playback state fetched successfully"
    )
  );
});

export { addToQueue, getSessionPlayback };
