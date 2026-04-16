import React, { useState } from "react";
import { User, Mail, Lock, UserPlus } from "lucide-react";
import API from "../../api/api";

interface SignUpProps {
  onClose: () => void;
  onSwitchToSignIn: () => void;
  // ✅ UPDATED: Signature now includes token
  onAuthSuccess: (username: string, token: string) => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSwitchToSignIn, onAuthSuccess }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      return setError("Passwords do not match.");
    }

    try {
      // 1. Register via API
      await API.post("/auth/register", {
        username,
        email,
        password,
      });

      // 2. Login immediately after to get the token
      const loginResponse = await API.post("/auth/login", {
        email,
        password,
      });
      // Extract token and username
      const { access_token, username: loggedInUser } = loginResponse.data;
      // 3. Pass both to the parent handler
      // This ensures the AuthContext gets the token to persist the session
      onAuthSuccess(loggedInUser, access_token);
    } catch (err: any) {
      console.error("Registration/Login error:", err);

      let errorMessage = "Registration failed";
      // Handle FastAPI error details
      if (err.response && err.response.data && err.response.data.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    }
  };

  return (
    <>
      <h2 className="text-3xl font-bold mb-8 text-center text-white">
        Create Your Account
      </h2>

      {error && <p className="text-red-400 text-center mb-3">{error}</p>}

      <div className="space-y-5">
        <div>
          <label className="text-gray-300">Username</label>
          <div className="relative">
            <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              className="w-full pl-10 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-gray-300">Email</label>
          <div className="relative">
            <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-gray-300">Password</label>
          <div className="relative">
            <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-gray-300">Confirm Password</label>
          <div className="relative">
            <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full pl-10 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg"
              required
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full px-5 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center gap-2 hover:from-blue-600 hover:to-purple-600 transition"
        >
          <UserPlus className="w-5 h-5" />
          Sign Up
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-gray-400">
        Already have an account?
        <button
          onClick={onSwitchToSignIn}
          className="text-blue-400 ml-2 hover:underline"
        >
          Sign In
        </button>
      </p>
    </>
  );
};

export default SignUp;
