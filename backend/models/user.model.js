import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    email: {
      type: string,
      required: true,
      unique: true,
      trim: true,
    },
    username: {
      type: string,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: string,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: string,
      required: true,
      minLength: 8,
    },
    refreshToken: {
      type: string,
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
    if (!this.isModified(this.password)) return this.password;
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

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      sub: this._id,
      email: this.email,
      username: this.username
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      sub: this._id,
      email: this.email,
      username: this.username
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const User = mongoose.model("User", userSchema);

export default User;
