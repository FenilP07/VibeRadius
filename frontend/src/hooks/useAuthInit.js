import { useEffect, useRef } from "react";
import useAuthStore from "../store/authStore";

export const useAuthInit = () => {
  const isLoading = useAuthStore((state) => state.isLoading);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const user = useAuthStore((state) => state.user);
  const verifyToken = useAuthStore((state) => state.verifyToken);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    console.log("🔐 Initializing auth session...");

    if (!user) {
      // Show loader on first app load
      verifyToken();
    } else {
      useAuthStore.setState({ isInitializing: false });
    }
  }, [verifyToken, user]);

  return { isAuthLoading: isLoading || isInitializing };
};
