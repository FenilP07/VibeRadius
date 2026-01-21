import { asyncHandler } from "../utils/asyncHandler.js";
import generateSessionCode from "../utils/generateSessionCode.js";
import Session from "../models/session.model.js";
import logger from "../utils/logger.js";
import { APIResponse } from "../utils/ApiResponse.js";
import {APIError} from "../utils/ApiError.js"

//create session
const createSession = asyncHandler(async (req, res) => {
  const { sessionName } = req.body;
  const hostId = req.user._id;
  const code = generateSessionCode();

  logger.info("Create session request received", {
    hostId,
    sessionName,
  });

  const session = await Session.create({
    host_id: hostId,
    session_name: sessionName,
    session_code: code,
  });

  logger.info("Session created successfully", {
    sessionId: session._id,
    sessionCode: session.session_code,
    hostId,
  });

  return res.status(201).json(
    new APIResponse(
      201,
      {
        session: {
          _id: session._id,
          host_id: session.host_id,
          session_name: session.session_name,
          session_code: session.session_code,
        },
      },
      "Session created succesfully"
    )
  );
});

//get session by hostID
const getMySession = asyncHandler(async (req, res) => {
  const hostId = req.user._id;

  const session = await Session.find({ host_id: hostId }).sort({
    createdAt: -1,
  });

  return res
    .status(200)
    .json(new APIResponse(200, { session }, "session fetched succesfully"));
});

//join session

const joinSession = asyncHandler(async (req, res) => {
  const userID = req.user_id;
  const { session_code } = req.body;

  const session = await Session.findOne({ session_code });

  session.participants.push(userID);
  await session.save();

  return res.status(200).json(
    new APIResponse(
      200,
      {
        session: {
          _id: session._id,
          session_name: session.session_name,
          session_code: session.session_code,
          participants: session.participants,
        },
      },
      "Joined session succesfully"
    )
  );
});

//leave session

//session status cahange
const sessionStatusChange = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const { sessionId } = req.params;
  const { session_status } = req.body;

  const session = await Session.findById({ sessionId });

  if (session.host_id.toString() !== hostId.toString())
    throw new APIError(403, "Only the host can change session status");
  session.session_status = session_status;
  await session.save();

  return res.status(200).json(
    new APIResponse(
      200,
      {
        sessionId: session._id,
        session_status: session.session_status,
      },
      "Session status updated successfully"
    )
  );
});

// delete session

const deleteSession = asyncHandler(async (req, res) => {
  const hostId = req.user._id;
  const { sessionId } = req.params;

  const session = await Session.findById(sessionId);

  if (session.host_id.toString() !== hostId.toString())
    throw new APIError(403, "Only the host can delete session");

  await session.deleteOne();

  return res
    .status(200)
    .json(new APIResponse(200, null, "Session deleted successfully"));
});

export {
  createSession,
  getMySession,
  joinSession,
  sessionStatusChange,
  deleteSession,
};
