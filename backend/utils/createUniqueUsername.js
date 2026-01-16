import User from "../models/user.model.js";
import { generateUsername } from "./generateRandomUsername.js";

const createUniqueUsername = async (maxRetries = 5) => {
    for (let i = 0; i < maxRetries; i++) {
        const username = generateUsername();
        const exists = await User.exists({ username });

        if (!exists) return username;
    }

    throw new Error("Failed to generate unique username");
};

export {
    createUniqueUsername
};