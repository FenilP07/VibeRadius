import Session from "../models/session.model.js";
import Queue from "../models/queue.model.js";
import Vote from "../models/vote.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/ApiError.js";
import { APIResponse } from "../utils/ApiResponse.js";

//add to queue
const addToQueue = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { session_id, track_id, title, artists, track_image } = req.body;

  const session = await Session.findById(session_id);
  if (!session) {
    throw new APIError(404, "Session not found");
  }

  const existingTrack = await Queue.findOne({
    session_id,
    track_id,
  });
  if (existingTrack) {
    throw new APIError(400, "Track already in queue");
  }

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

  return res
    .status(201)
    .json(new APIResponse(201, { queueTrack }, "Track added to queue"));
});

//get session playback
const getSessionPlayback = asyncHandler(async (req, res) => {
  const { session_id } = req.params;

  const session = await Session.findById(session_id).populate({
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

//upvote
const upvote = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { session_id, queue_track_id } = req.body;

  const session = await Session.findById(session_id);
  const queueTrack = await Queue.findOne({
    _id: queue_track_id,
    session_id,
    status: "queued",
  });

  await Vote.create({
    session_id,
    track_id: queue_track_id,
    user_id: userId,
  });

  queueTrack.total_votes += 1;
  await queueTrack.save();
  return res.status(200).json(
    new APIResponse(
      200,
      {
        queue_track_id,
        total_votes: queue_track_id.total_votes,
      },
      "Vote added successfully"
    )
  );
});

//unvote

//next track

const playNextTrack = asyncHandler(async (req, res) => {
  const hostId = req.user.user_id;
  const { session_id } = req.params;

  const session = await Session.findById(session_id);

  const nextTrack = await Queue.findOne({
    session_id: session_id,
    status: "queued",
  }).sort({ total_votes: -1, createdAt: 1 });

  if (session.current_track_id) {
    await Queue.findByIdAndUpdate(session.current_track_id, {
      status: "played",
    });
  }

  nextTrack.status = "playing";
  await nextTrack.save();

  session.current_track_id = nextTrack._id;
  await session.save();

  return res
    .status(200)
    .json(
      new APIResponse(200, { current_track: nextTrack }, "Playing next track")
    );
});

export { addToQueue, getSessionPlayback, upvote, playNextTrack };
