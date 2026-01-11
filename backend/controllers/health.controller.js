import { asyncHandler } from "../utils/asyncHandler.js";
import { APIResponse } from "../utils/ApiResponse.js";

const healthCheck = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(
      new APIResponse(200, { uptime: process.uptime() }, "server is health")
    );
});

export { healthCheck };
