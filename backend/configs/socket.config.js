import {registerSessionNamespace} from "../socket/namespaces/session.namespace.js";

const registerSockets = (io) => {
  console.log("registerSockets received io:", !!io);
  registerSessionNamespace(io);
};

export default registerSockets;
