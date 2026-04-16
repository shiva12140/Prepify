import React, { useState, type FormEvent } from "react";
import { Mail, Lock, LogIn } from "lucide-react";
import API from "../../api/api";
import { useAuth } from "../context/AuthContext";

interface SignInProps {
  onSwitchToSignUp: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSwitchToSignUp }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/auth/login", { email, password });

      // ✅ UPDATED: Pass token to login() to persist session
      login(
        res.data.username || res.data.user?.username || "User",
        res.data.access_token
      );
    } catch (err: any) {
      console.error("Login error:", err);

      let errorMessage = "Login failed.";
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === "string") errorMessage = detail;
        else if (Array.isArray(detail)) {
          const first = detail[0];
          errorMessage = `${first.loc.join(" -> ")}: ${first.msg}`;
        }
      }

      setError(errorMessage);
    }
  };

  return (
    <>
      <h2 className="text-3xl font-bold mb-8 text-center text-white">
        Welcome Back
      </h2>

      {error && <p className="text-red-400 text-center mb-3">{error}</p>}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm mb-1 text-gray-300">Email</label>
          <div className="relative">
            <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="text"
              placeholder="username or email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1 text-gray-300">Password</label>
          <div className="relative">
            <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 py-3 bg-slate-800 border border-slate-700 text-white rounded-lg"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full px-5 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-gray-500 text-white flex items-center justify-center gap-2"
        >
          <LogIn className="w-5 h-5" />
          Sign In
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-400">
        Don’t have an account?{" "}
        <button onClick={onSwitchToSignUp} className="ml-2 text-blue-400">
          Sign Up
        </button>
      </p>
    </>
  );
};

export default SignIn;
