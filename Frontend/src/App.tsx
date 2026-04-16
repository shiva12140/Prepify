import React from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import Notes from "./pages/note";
import AIInterview from "./pages/AiInterview";
import Quize from "./pages/quize";
import Sidebar from "./components/dashboard/Sidebar";

import { AuthProvider, useAuth } from "./components/context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { Loader2 } from "lucide-react";

// Layout for authenticated users
const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/AIInterview" element={<AIInterview />} />
          <Route path="/quize" element={<Quize />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
};

// Wrapper for Home to handle "If logged in, go to dashboard" logic
const HomeWrapper = () => {
  const { isAuthenticated, login } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Home onLogin={login} />;
};

// Main Routing Logic extracted to use AuthContext
const AppRoutes = () => {
  const { isLoading } = useAuth();

  // 1. Show a loading spinner while checking auth state
  // This prevents the "flash" of redirecting to home/dashboard on reload
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Home */}
        <Route path="/" element={<HomeWrapper />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
