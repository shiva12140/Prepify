import React from "react";
import YearlyStreak from "../components/dashboard/YearlyStreak";
import FeedbackScore from "../components/dashboard/FeedBackScore";
import SkillRadarChart from "../components/dashboard/SkillRadarChart";
import { generateYearlyStreakData } from "../utils/generateYearlyStreakData";
import { useAuth } from "../components/context/AuthContext";
import {
  PlayCircle,
  FileText,
  CheckCircle,
  Brain,
  TrendingUp,
  AlertCircle,
  Clock,
} from "lucide-react";

const Dashboard = () => {
  const { username } = useAuth();
  const streakData = generateYearlyStreakData();

  // Mock Data for Charts
  const radarData = [
    { skill: "DSA", value: 70 },
    { skill: "System Design", value: 60 },
    { skill: "Communication", value: 85 },
    { skill: "Problem Solving", value: 75 },
    { skill: "Accuracy", value: 68 },
    { skill: "Time Mgmt", value: 80 },
  ];

  // Mock Data for Recent Activity
  const recentActivities = [
    {
      id: 1,
      type: "interview",
      title: "React Native Interview",
      date: "Today, 10:23 AM",
      score: "85%",
      icon: <PlayCircle size={20} />,
    },
    {
      id: 2,
      type: "quiz",
      title: "Frontend Basics MCQ",
      date: "Yesterday",
      score: "92%",
      icon: <CheckCircle size={20} />,
    },
    {
      id: 3,
      type: "note",
      title: "System_Design_Notes.pdf",
      date: "2 days ago",
      status: "Uploaded",
      icon: <FileText size={20} />,
    },
  ];

  // Mock Data for Quiz Stats
  const quizStats = {
    completed: 15,
    accuracy: 72,
    weakestTopic: "Dynamic Programming",
    strongestTopic: "React Hooks",
  };

  return (
    // 1. Page Background: #434E78
    <div className="px-6 py-8 space-y-8 min-h-screen text-white bg-[#434E78] font-sans">
      {/* ----------- HEADER SECTION ----------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold font-handwriting tracking-wide">
            Welcome back,{" "}
            <span className="text-[#F7E396]">{username || "User"}!</span>
          </h1>
          <p className="text-[#607B8F] text-gray-300 mt-1">
            Track your progress and stay consistent.
          </p>
        </div>

        <button className="px-6 py-3 bg-[#F7E396] text-[#434E78] rounded-xl shadow-lg hover:bg-[#E97F4A] hover:text-white transition-all duration-300 font-bold flex items-center gap-2 transform hover:-translate-y-1">
          <PlayCircle size={20} />
          Start New Interview
        </button>
      </div>

      {/* ----------- TOP ROW: Performance & Skills ----------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. AI Feedback Score */}
        <div className="bg-[#607B8F] rounded-2xl shadow-xl p-6 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Brain className="text-[#F7E396]" size={24} /> AI Feedback Score
            </h2>
            <span className="text-xs font-mono text-[#F7E396] bg-[#434E78] px-2 py-1 rounded">
              AVG
            </span>
          </div>
          {/* Passed prop to handle transparent background in child */}
          <FeedbackScore
            confidence={78}
            clarity={82}
            accuracy={70}
            speed={65}
            improvements={[
              "Improve explanation clarity",
              "Practice more DP problems",
            ]}
          />
        </div>

        {/* 2. Skill Radar Chart */}
        <div className="bg-[#607B8F] rounded-2xl shadow-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="text-[#F7E396]" size={24} /> Skill Analysis
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
        <div className="bg-[#607B8F] rounded-2xl shadow-xl p-6 border border-white/10">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="text-[#F7E396]" size={24} /> Recent Activity
          </h2>

          <div className="space-y-4">
            {recentActivities.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-[#434E78]/50 rounded-xl border border-white/5 hover:border-[#F7E396]/50 transition cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-full ${
                      item.type === "interview"
                        ? "bg-blue-500/20 text-blue-300"
                        : item.type === "quiz"
                        ? "bg-green-500/20 text-green-300"
                        : "bg-purple-500/20 text-purple-300"
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
                  {item.score ? (
                    <span className="text-lg font-bold text-[#F7E396]">
                      {item.score}
                    </span>
                  ) : (
                    <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Quiz & Knowledge Metrics */}
        <div className="bg-[#607B8F] rounded-2xl shadow-xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <CheckCircle className="text-[#F7E396]" size={24} /> Quiz &
              Knowledge
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-[#434E78]/50 rounded-xl border border-white/5">
                <p className="text-gray-300 text-sm">Quizzes Completed</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {quizStats.completed}
                </p>
              </div>
              <div className="p-4 bg-[#434E78]/50 rounded-xl border border-white/5">
                <p className="text-gray-300 text-sm">Avg. Accuracy</p>
                <p className="text-3xl font-bold text-[#F7E396] mt-1">
                  {quizStats.accuracy}%
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <span className="text-sm text-red-200 flex items-center gap-2">
                  <AlertCircle size={16} /> Weakest Topic
                </span>
                <span className="font-bold text-red-100">
                  {quizStats.weakestTopic}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <span className="text-sm text-green-200 flex items-center gap-2">
                  <TrendingUp size={16} /> Strongest Topic
                </span>
                <span className="font-bold text-green-100">
                  {quizStats.strongestTopic}
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
      <div className="bg-[#607B8F] rounded-2xl shadow-xl p-6 border border-white/10">
        <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
          <Clock className="text-[#F7E396]" size={24} /> Activity Streak
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
