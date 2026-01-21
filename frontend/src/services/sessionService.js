import apiClient from "./authService";
const sessionApiPrefix = "/api/session";

export const sessionService = {
  getDashboardData: async () => {
    return await apiClient.get(`${sessionApiPrefix}/dashboard`);
  },
};
