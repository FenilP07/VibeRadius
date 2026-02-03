import { registerDashboardNamespace } from "../socket/namespaces/dashboard.namespace.js";
import { registerSessionNamespace } from "../socket/namespaces/session.namespace.js";

const registerSockets = (io) => {
  console.log("registerSockets received io:", !!io);
  registerSessionNamespace(io);
  registerDashboardNamespace(io);
};

export default registerSockets;
