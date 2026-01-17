import mongoose from "mongoose";

const spotifyTokenSchema = new mongoose.Schema({
  // existing user (owner/admin)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // connects to user model
    required: true,
    unique: true, // one spotify login for each owner
  },
  accessToken: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  scope: {
    // saving scopre for ref, if we change scope in env later, this gets intaced
    type: String,
    required: true,
  },

  lastRefreshed: {
    type: Date,
    default: Date.now,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Mongoose Hooks

spotifyTokenSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("SpotifyToken", spotifyTokenSchema);
