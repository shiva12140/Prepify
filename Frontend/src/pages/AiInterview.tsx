import React, { useEffect, useState } from "react";
import Vapi from "@vapi-ai/web";
import {
  Mic,
  MicOff,
  PhoneOff,
  Send,
  Loader2,
  Volume2,
  ChevronDown,
} from "lucide-react";
// Import useAuth to get dynamic username
import { useAuth } from "../components/context/AuthContext";

// --- CONFIG ---
const VAPI_PUBLIC_KEY = "6e393730-74a2-4690-8cb7-845ed3880488";
const BACKEND_URL = "";

const vapi = new Vapi(VAPI_PUBLIC_KEY);

function AIInterview() {
  const { username } = useAuth();
  const [viewState, setViewState] = useState<"config" | "interview">("config");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState("Idle");

  // Form State
  const [name, setName] = useState(username || "Candidate");
  const [role, setRole] = useState("Senior Frontend Developer");
  const [exp, setExp] = useState("5");
  // UPDATED: Default difficulty
  const [difficulty, setDifficulty] = useState("Medium (Intermediate)");

  useEffect(() => {
    if (username) setName(username);
  }, [username]);

  useEffect(() => {
    vapi.on("call-start", () => {
      setStatus("Connected");
      setIsSessionActive(true);
      setViewState("interview");
      setIsMuted(false);
    });

    vapi.on("call-end", () => {
      setStatus("Call Ended");
      setIsSessionActive(false);
      setIsSpeaking(false);
      setViewState("config");
    });

    vapi.on("speech-start", () => setIsSpeaking(true));
    vapi.on("speech-end", () => setIsSpeaking(false));

    vapi.on("error", (e) => {
      console.error("Vapi Error:", e);
      setStatus("Error connecting");
      setIsSessionActive(false);
      setViewState("config");
    });

    return () => {
      vapi.stop();
      vapi.removeAllListeners();
    };
  }, []);

  const startInterview = async () => {
    setStatus("Configuring...");
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/v1/interview/api/get-vapi-config`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            job_role: role,
            experience: exp,
            level: difficulty,
          }),
        }
      );

      const data = await response.json();
      if (!data.assistantId || !data.overrides)
        throw new Error("Invalid config");

      setStatus("Connecting...");
      vapi.start(data.assistantId, data.overrides);
    } catch (err: any) {
      console.error("Error:", err);
      setStatus("Failed to start");
    }
  };

  const stopInterview = () => {
    vapi.stop();
  };

  const toggleMute = () => {
    const newMuteState = !isMuted;
    vapi.setMuted(newMuteState);
    setIsMuted(newMuteState);
  };

  // --- RENDER ---
  return (
    <div className="h-screen w-full font-sans text-white relative bg-[#434E78] overflow-hidden flex items-center justify-center">
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#F7E396] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-[#607B8F] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 w-full max-w-4xl p-6 flex flex-col items-center">
        {viewState === "config" && (
          <div className="w-full max-w-2xl bg-[#607B8F] rounded-xl shadow-2xl border border-white/10 p-8 md:p-12 transition-all transform animate-fade-in-up">
            <div className="mb-8 text-center">
              <h1 className="text-5xl font-bold text-white mb-2 font-handwriting drop-shadow-md">
                Prep AI
              </h1>
              <div className="flex items-center justify-center gap-2 text-[#F7E396]">
                <Volume2 className="w-6 h-6" />
                <span className="font-semibold tracking-wide">
                  Configure Your Interview
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#F7E396] mb-2 tracking-wide">
                  Candidate Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 rounded-lg bg-[#434E78]/50 border-2 border-transparent focus:border-[#F7E396] focus:ring-0 outline-none transition text-white font-medium placeholder-gray-300 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#F7E396] mb-2 tracking-wide">
                  1. Job Role/Position
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-4 rounded-lg bg-[#434E78]/50 border-2 border-transparent focus:border-[#F7E396] focus:ring-0 outline-none transition text-white font-medium placeholder-gray-300 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#F7E396] mb-2 tracking-wide">
                  2. Years of Professional Experience
                </label>
                <input
                  type="text"
                  value={exp}
                  onChange={(e) => setExp(e.target.value)}
                  className="w-full p-4 rounded-lg bg-[#434E78]/50 border-2 border-transparent focus:border-[#F7E396] focus:ring-0 outline-none transition text-white font-medium placeholder-gray-300 shadow-inner"
                />
              </div>

              {/* UPDATED: Difficulty Selection Dropdown */}
              <div>
                <label className="block text-sm font-bold text-[#F7E396] mb-2 tracking-wide">
                  3. Difficulty Level
                </label>
                <div className="relative">
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-4 rounded-lg bg-[#434E78]/50 border-2 border-transparent focus:border-[#F7E396] focus:ring-0 outline-none transition text-white font-medium shadow-inner appearance-none cursor-pointer"
                  >
                    <option value="Easy (Beginner)">Easy (Beginner)</option>
                    <option value="Medium (Intermediate)">
                      Medium (Intermediate)
                    </option>
                    <option value="Hard (Advanced)">Hard (Advanced)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white pointer-events-none w-5 h-5" />
                </div>
              </div>

              <button
                onClick={startInterview}
                disabled={
                  status === "Configuring..." || status === "Connecting..."
                }
                className="mt-6 px-8 py-4 bg-[#F7E396] text-[#434E78] font-bold text-lg rounded-lg shadow-lg hover:bg-[#E97F4A] hover:text-white transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3 w-full justify-center"
              >
                {status === "Configuring..." || status === "Connecting..." ? (
                  <Loader2 className="animate-spin w-6 h-6" />
                ) : (
                  <Send className="w-6 h-6" />
                )}
                <span>Start Interview</span>
              </button>
            </div>
          </div>
        )}

        {viewState === "interview" && (
          <div className="flex flex-col items-center justify-center w-full h-full animate-fade-in-up">
            <div className="relative mb-16">
              <div
                className={`
                    w-56 h-56 rounded-full 
                    bg-[#607B8F]
                    shadow-[0_0_40px_#F7E396]
                    transition-all duration-300 ease-in-out
                    flex items-center justify-center
                    border-4 border-white/20
                    ${
                      isSpeaking
                        ? "animate-pulse scale-110 shadow-[0_0_60px_#F7E396]"
                        : "animate-bounce"
                    }
                 `}
              >
                {isSpeaking ? (
                  <Volume2 className="text-white w-20 h-20 opacity-90 drop-shadow-md" />
                ) : (
                  <div className="w-4 h-4 bg-white rounded-full opacity-50 shadow-[0_0_10px_white]"></div>
                )}
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-10 font-handwriting tracking-wider drop-shadow-md">
              {isSpeaking ? "Prep AI is speaking..." : "Listening to you..."}
            </h2>

            <div className="bg-[#607B8F] p-4 rounded-2xl shadow-xl border border-white/10 flex gap-6">
              <button
                onClick={toggleMute}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition font-bold shadow-md ${
                  isMuted
                    ? "bg-[#E97F4A] text-white hover:bg-orange-600"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                }`}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                {isMuted ? "Unmute" : "Mute"}
              </button>

              <button
                onClick={stopInterview}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white border border-transparent rounded-xl transition font-bold shadow-md"
              >
                <PhoneOff size={20} /> End Call
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIInterview;
