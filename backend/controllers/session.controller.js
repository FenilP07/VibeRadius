import { asyncHandler } from "../utils/asyncHandler.js";
import generateSessionCode from "../utils/generateSessionCode.js";
import Session from "../models/session.model.js";
import logger from "../utils/logger.js";


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

export { createSession };
