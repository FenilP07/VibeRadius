// utils/asyncHandler.js
const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    // Check if next is a function before calling it
    if (typeof next === "function") {
      next(err);
    } else {
      // If no next function, handle the error directly
      console.error("Error in async handler:", err);
      if (res && !res.headersSent) {
        res.status(500).json({ error: err.message });
      }
    }
  }
};

export { asyncHandler };
