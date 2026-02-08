import Session from "../../models/session.model.js";
import logger from "../../utils/logger.js";

class SessionService {
  async addUserToSession(sessionCode, userId, userName) {
    try {
      const session = await Session.findOneAndUpdate(
        { session_code: sessionCode },
        {
          $addToSet: { participants: { id: userId, name: userName } }, // ensures no duplicates
        },
        { new: true }
      );

      if (!session) {
        logger.warn(`Session ${sessionCode} not found`);
        return null;
      }

      logger.info(
        `✅ User ${userId} added/updated in session ${sessionCode}. Total participants: ${session.participants.length}`
      );

      return session;
    } catch (err) {
      logger.error(`❌ Error adding user to session: ${err.message}`);
      throw err;
    }
  }

  async removeUserFromSession(query, userId) {
    try {
      const session = await Session.findOneAndUpdate(
        query,
        { $pull: { participants: { id: userId } } },
        { new: true }
      );

      if (!session) {
        logger.warn(`Session not found for query:`, query);
        return null;
      }

      logger.info(
        `✅ User ${userId} removed from session ${session._id}. Participants remaining: ${session.participants.length}`
      );

      return session;
    } catch (err) {
      logger.error(`❌ Error removing user from session: ${err.message}`);
      throw err;
    }
  }

  getSessionById(sessionId) {
    return Session.findById(sessionId);
  }

  getSessionByCode(sessionCode) {
    return Session.findOne({ session_code: sessionCode });
  }

  getRoomId(session) {
    return session?._id?.toString();
  }

  getParticipantCount(session) {
    return session?.participants?.length || 0;
  }
}

export default new SessionService();
