// sockets/index.js
import registerSessionNamespace from "../socket/session.socket.js";

const registerSockets = (io) => {
    console.log("registerSockets received io:", !!io);
  registerSessionNamespace(io);
};

export default registerSockets;
