import AppRoutes from "./AppRoutes";
import { useAuthInit } from "./hooks/useAuthInit";
import "./app.css";

function App() {
  // Initialize auth on app load
  const { isLoading } = useAuthInit();

  // Show a spinner while verifying the user
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-text-secondary text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Once user is verified, show the app routes
  return <AppRoutes />;
}

export default App;
