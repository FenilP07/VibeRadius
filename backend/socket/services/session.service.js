import Session from "../../models/session.model.js";
import logger from "../../utils/logger.js";

class sessionService {
  async addUserToSession(sessionCode, userId, userName) {
    let session = null;
    try {
      // Fetch the session
      session = await Session.findOne({ session_code: sessionCode });
      
      if (!session) {
        logger.warn(`Session ${sessionCode} not found`);
        return null;
      }

      // ✅ DEBUG: Log what we're starting with
      logger.info(`BEFORE cleanup - Participants:`, JSON.stringify(session.participants));

      // ✅ AGGRESSIVELY clean corrupted participants
      const cleanParticipants = [];
      
      if (Array.isArray(session.participants)) {
        for (const p of session.participants) {
          // Only keep participants with valid id AND name
          if (
            p && 
            typeof p === 'object' &&
            p.id && 
            typeof p.id === 'string' && 
            p.id.trim() !== '' &&
            p.name && 
            typeof p.name === 'string' && 
            p.name.trim() !== ''
          ) {
            cleanParticipants.push({ id: p.id, name: p.name });
          } else {
            logger.warn(`Skipping invalid participant:`, JSON.stringify(p));
          }
        }
      }

      // Check if user already exists in clean list
      const existingIndex = cleanParticipants.findIndex(
        (p) => p.id === userId
      );

      if (existingIndex !== -1) {
        // Update existing participant
        cleanParticipants[existingIndex].name = userName;
      } else {
        // Add new participant
        cleanParticipants.push({ id: userId, name: userName });
      }

      // ✅ DEBUG: Log what we're about to save
      logger.info(`AFTER cleanup - Clean participants:`, JSON.stringify(cleanParticipants));

      // Replace with clean array - MARK AS MODIFIED
      session.participants = cleanParticipants;
      session.markModified('participants');

      // ✅ DEBUG: Validate before saving
      const validationError = session.validateSync();
      if (validationError) {
        logger.error(`Validation error BEFORE save:`, validationError.message);
        logger.error(`Current participants:`, JSON.stringify(session.participants));
        throw validationError;
      }

      // Save and return
      await session.save();
      
      logger.info(`✅ User ${userId} added to session ${sessionCode}. Total participants: ${session.participants.length}`);
      
      return session;
    } catch (err) {
      logger.error(`❌ Error adding user to session: ${err.message}`);
      if (session) {
        logger.error(`Session state:`, JSON.stringify({
          _id: session._id,
          session_code: session.session_code,
          participants: session.participants
        }));
      }
      throw err;
    }
  }

  async removeUserFromSession(query, userId) {
    let session = null;
    try {
      // Fetch the session
      session = await Session.findOne(query);
      
      if (!session) {
        logger.warn(`Session not found for query:`, query);
        return null;
      }

      // Get initial count
      const initialCount = session.participants.length;

      // ✅ AGGRESSIVELY clean corrupted participants AND remove the user
      const cleanParticipants = [];
      
      if (Array.isArray(session.participants)) {
        for (const p of session.participants) {
          // Only keep valid participants that are NOT the user being removed
          if (
            p && 
            typeof p === 'object' &&
            p.id && 
            typeof p.id === 'string' && 
            p.id.trim() !== '' &&
            p.name && 
            typeof p.name === 'string' && 
            p.name.trim() !== '' &&
            p.id !== userId
          ) {
            cleanParticipants.push({ id: p.id, name: p.name });
          }
        }
      }

      // Replace with clean array
      session.participants = cleanParticipants;
      session.markModified('participants');

      await session.save();
      logger.info(`✅ User ${userId} removed from session. Participants: ${initialCount} → ${session.participants.length}`);

      return session;
    } catch (err) {
      logger.error(`❌ Error removing user from session: ${err.message}`);
      throw err;
    }
  }

  getRoomId(session) {
    return session?._id?.toString();
  }

  getParticipantCount(session) {
    return session?.participants?.length || 0;
  }
}

export default new sessionService();