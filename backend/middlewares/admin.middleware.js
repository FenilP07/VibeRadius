import APIResponse from "../";

const isAdmin = async (req, res, next) => {
  if (req.user.role !== "host") {
    return res
      .status(403)
      .json(new APIResponse(403, null, "Admin access required"));
  }
  next();
};

export { isAdmin };
