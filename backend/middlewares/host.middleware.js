import APIResponse from "../utils/ApiResponse.js";

const isHost = (req, res, next) => {
  if (req.user.role !== "host") {
    return res
      .status(403)
      .json(new APIResponse(403, null, "Host access required"));
  }
  next();
};

export { isHost };
