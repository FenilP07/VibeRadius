import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// pre hook to hash password
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    const saltRound = 10; // number of character in the password
    this.password = await bcrypt.hash(this.password, saltRound);
    next();
  } catch (error) {
    next(error);
  }
});

// password check
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
