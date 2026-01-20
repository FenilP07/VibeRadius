import { useEffect, useRef } from "react";
import useAuthStore from "../store/authStore";

export const useAuthInit = () => {
  const verifyToken = useAuthStore((state) => state.verifyToken);
  const isLoading = useAuthStore((state) => state.isLoading);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;

    hasInitialized.current = true;

    // Call verifyToken once, ignore errors for now
    verifyToken().catch((err) => {
      console.warn("verifyToken failed:", err.message || err);
    });
  }, [verifyToken]);

  return { isLoading };
};
