import React, { useEffect, useState } from "react";
import YearlyStreak from "../components/dashboard/YearlyStreak";
import FeedbackScore from "../components/dashboard/FeedBackScore";
import SkillRadarChart from "../components/dashboard/SkillRadarChart";
import { generateYearlyStreakData } from "../utils/generateYearlyStreakData";
import { useAuth } from "../components/context/AuthContext";
import API from "../api/api";
import {
  PlayCircle,
  FileText,
  CheckCircle,
  Brain,
  TrendingUp,
  AlertCircle,
  Clock,
  MessageSquare,
  Loader2,
} from "lucide-react";

interface DashboardStats {
  username: string;
  notes_count: number;
  sessions_count: number;
  messages_count: number;
  active_days_last_30: number;
  recent_activity: {
    id: string | number;
    type: string;
    title: string;
    date: string | null;
  }[];
}

const Dashboard = () => {
  const { username } = useAuth();
  const streakData = generateYearlyStreakData();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/dashboard/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Radar data — uses real stats where available, falls back to defaults
  const radarData = [
    { skill: "Notes Uploaded", value: stats ? Math.min(stats.notes_count * 10, 100) : 0 },
    { skill: "Chat Sessions", value: stats ? Math.min(stats.sessions_count * 10, 100) : 0 },
    { skill: "Messages Sent", value: stats ? Math.min(stats.messages_count * 2, 100) : 0 },
    { skill: "Active Days", value: stats ? Math.min(stats.active_days_last_30 * 3.3, 100) : 0 },
    { skill: "Engagement", value: stats ? Math.min((stats.notes_count + stats.sessions_count) * 8, 100) : 0 },
    { skill: "Consistency", value: stats ? Math.min(stats.active_days_last_30 * 5, 100) : 0 },
  ];

  // Format relative date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const recentActivities = stats?.recent_activity?.map((item, idx) => ({
    id: item.id || idx,
    type: item.type,
    title: item.title,
    date: formatDate(item.date),
    icon: item.type === "note" ? <FileText size={20} /> : <MessageSquare size={20} />,
    status: item.type === "note" ? "Uploaded" : "Chat",
  })) || [];

  const quizStats = {
    completed: stats?.sessions_count || 0,
    accuracy: stats ? Math.min(Math.round((stats.messages_count / Math.max(stats.sessions_count, 1)) * 10), 100) : 0,
    notesUploaded: stats?.notes_count || 0,
    activeDays: stats?.active_days_last_30 || 0,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A2517]">
        <Loader2 className="animate-spin w-10 h-10 text-[#ACC8A2]" />
      </div>
    );
  }

  return (
    // 1. Page Background: #1A2517
    <div className="px-6 py-8 space-y-8 min-h-screen text-white bg-[#1A2517] font-sans">
      {/* ----------- HEADER SECTION ----------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold font-handwriting tracking-wide">
            Welcome back,{" "}
            <span className="text-[#ACC8A2]">{username || "User"}!</span>
          </h1>
          <p className="text-[#2D3B28] text-gray-300 mt-1">
            Track your progress and stay consistent.
          </p>
        </div>

        <button className="px-6 py-3 bg-[#ACC8A2] text-[#1A2517] rounded-xl shadow-lg hover:bg-[#7BA370] hover:text-white transition-all duration-300 font-bold flex items-center gap-2 transform hover:-translate-y-1">
          <PlayCircle size={20} />
          Start New Interview
        </button>
      </div>

      {/* ----------- TOP ROW: Performance & Skills ----------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. AI Feedback Score */}
        <div className="bg-[#2D3B28] rounded-2xl shadow-xl p-6 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Brain className="text-[#ACC8A2]" size={24} /> AI Feedback Score
            </h2>
            <span className="text-xs font-mono text-[#ACC8A2] bg-[#1A2517] px-2 py-1 rounded">
              AVG
            </span>
          </div>
          {/* Passed prop to handle transparent background in child */}
          <FeedbackScore
            confidence={Math.min(stats?.notes_count ? stats.notes_count * 12 : 10, 95)}
            clarity={Math.min(stats?.messages_count ? stats.messages_count * 3 : 10, 95)}
            accuracy={Math.min(stats?.sessions_count ? stats.sessions_count * 15 : 10, 95)}
            speed={Math.min(stats?.active_days_last_30 ? stats.active_days_last_30 * 5 : 10, 95)}
            improvements={
              stats?.notes_count === 0
                ? ["Upload your first PDF to get started", "Try the AI Interview feature"]
                : ["Keep uploading notes regularly", "Chat with your documents for deeper understanding"]
            }
          />
        </div>

        {/* 2. Skill Radar Chart */}
        <div className="bg-[#2D3B28] rounded-2xl shadow-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="text-[#ACC8A2]" size={24} /> Skill Analysis
            </h2>
          </div>
          <div className="h-64 w-full">
            <SkillRadarChart data={radarData} />
          </div>
        </div>
      </div>

      {/* ----------- MIDDLE ROW: Activity & Quiz Stats ----------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Recent Activity List */}
        <div className="bg-[#2D3B28] rounded-2xl shadow-xl p-6 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="text-[#ACC8A2]" size={24} /> Recent Activity
          </h2>

          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <FileText size={40} className="mx-auto mb-3 opacity-30" />
                <p>No activity yet. Upload a PDF or start a chat!</p>
              </div>
            ) : (
              recentActivities.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-[#1A2517]/50 rounded-xl border border-white/5 hover:border-[#ACC8A2]/50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-full ${
                        item.type === "note"
                          ? "bg-purple-500/20 text-purple-300"
                          : "bg-green-500/20 text-green-300"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{item.title}</h4>
                      <p className="text-xs text-gray-300">{item.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 4. Quiz & Knowledge Metrics */}
        <div className="bg-[#2D3B28] rounded-2xl shadow-xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <CheckCircle className="text-[#ACC8A2]" size={24} /> Usage &
              Knowledge
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-[#1A2517]/50 rounded-xl border border-white/5">
                <p className="text-gray-300 text-sm">Notes Uploaded</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {quizStats.notesUploaded}
                </p>
              </div>
              <div className="p-4 bg-[#1A2517]/50 rounded-xl border border-white/5">
                <p className="text-gray-300 text-sm">Chat Sessions</p>
                <p className="text-3xl font-bold text-[#ACC8A2] mt-1">
                  {quizStats.completed}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <span className="text-sm text-blue-200 flex items-center gap-2">
                  <MessageSquare size={16} /> Total Messages
                </span>
                <span className="font-bold text-blue-100">
                  {stats?.messages_count || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <span className="text-sm text-green-200 flex items-center gap-2">
                  <TrendingUp size={16} /> Active Days (30d)
                </span>
                <span className="font-bold text-green-100">
                  {quizStats.activeDays}
                </span>
              </div>
            </div>
          </div>

          <button className="w-full mt-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/10 transition text-sm font-semibold">
            View Detailed Analysis
          </button>
        </div>
      </div>

      {/* ----------- BOTTOM ROW: Yearly Streak ----------- */}
      <div className="bg-[#2D3B28] rounded-2xl shadow-xl p-6 border border-white/10">
        <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
          <Clock className="text-[#ACC8A2]" size={24} /> Activity Streak
        </h2>
        {/* Container for the streak chart to handle responsiveness */}
        <div className="overflow-x-auto pb-2">
          <YearlyStreak data={streakData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
