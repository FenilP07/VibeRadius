import apiClient from "../utils/apiClient";
const sessionApiPrefix = "/api/session";

export const sessionService = {
  getDashboardData: async () => {
    return await apiClient.get(`${sessionApiPrefix}/dashboard`);
  },
};
