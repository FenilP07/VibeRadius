import { useEffect } from "react";
import { useParams } from "react-router-dom";
import useLiveSessionStore from "../store/liveSessionStore";
import { useSessionSocket } from "../socket/session.socket";

const TestSessionPage = ({ testSessionCode }) => {
  const {
    sessionCode,
    setSessionCode,
    participants,
    participantCount,
    sessionStatus,
    handleUserJoined,
    handleUserLeft,
    updateSessionStatus,
  } = useLiveSessionStore();

  // Use test code if provided, otherwise URL param
  const { code } = useParams();

  useEffect(() => {
    if (testSessionCode) setSessionCode(testSessionCode);
    else if (code) setSessionCode(code);
  }, [code, testSessionCode, setSessionCode]);

  // Wire sockets
  useSessionSocket(
    sessionCode,
    {
      user_joined: handleUserJoined,
      user_left: handleUserLeft,
      session_status_updated: ({ status }) => updateSessionStatus(status),
    },
  
  );

  return (
    <div style={{ padding: 24 }}>
      <h1>Test Live Session</h1>
      <p>
        <strong>Session Code:</strong> {sessionCode}
      </p>
      <p>
        <strong>Status:</strong> {sessionStatus}
      </p>
      <p>
        <strong>Participants ({participantCount}):</strong>
      </p>
      <ul>
        {participants.map((id) => (
          <li key={id}>{id}</li>
        ))}
      </ul>
    </div>
  );
};

export default TestSessionPage;
