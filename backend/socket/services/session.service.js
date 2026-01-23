import Session from "../../models/session.model.js";
import logger from "../../utils/logger.js";

class sessionService {
  async addUserToSession(sessionCode, userId) {
    try {
      const session = await Session.findOneAndUpdate(
        {
          session_code: sessionCode,
        },
        {
          $addToSet: {
            participants: userId,
          },
        },
        { new: true }
      );
      return session;
    } catch (err) {
      logger.error(`Error adding user to session: ${err.message}`);
      throw err;
    }
  }

  async removeUserFromSession(query, userId) {
    try {
      const session = await Session.findOneAndDelete(
        query,
        {
          $pull: {
            participants: userId,
          },
        },
        { new: true }
      );
      return session;
    } catch (err) {
      logger.error(`Error removing user from session: ${err.message}`);
      throw err;
    }
  }

  getRoomId(session) {
    return session?._id?.toString();
  }

  getParticipantCount(session) {
    return session?.participants?.legth || 0;
  }
}

export default new sessionService();
