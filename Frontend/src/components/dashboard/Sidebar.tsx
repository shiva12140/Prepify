import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  FileText,
  Brain,
  BookOpen,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { username, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { path: "/notes", label: "Notes", icon: <BookOpen size={20} /> },
    { path: "/AIInterview", label: "AI Interview", icon: <Brain size={20} /> },
    { path: "/quize", label: "Resume Quiz", icon: <FileText size={20} /> },
  ];

  return (
    <aside
      // 1. MAIN BACKGROUND: #434E78
      className={`flex flex-col justify-between h-screen bg-[#434E78] text-white transition-all duration-300 shadow-xl border-r border-[#607B8F]/50 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Top Section */}
      <div>
        <div className="flex items-center justify-between font-bold py-6 px-6 border-b border-[#607B8F]/50">
          {!collapsed && (
            <span className="text-xl tracking-wide font-handwriting text-[#F7E396]">
              Prep AI
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 hover:bg-[#E97F4A] rounded-full transition text-white"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="p-4 space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              // 2. BUTTON LOGIC:
              // - Default: bg-[#607B8F]
              // - Hover: bg-[#E97F4A]
              // - Active: Border #F7E396 (Highlight)
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 border-2
                ${
                  location.pathname === item.path
                    ? "bg-[#607B8F] border-[#F7E396] shadow-lg translate-x-1"
                    : "bg-[#607B8F] border-transparent hover:bg-[#E97F4A] text-gray-100 hover:text-white"
                }`}
            >
              <span className="text-white">{item.icon}</span>
              {!collapsed && (
                <span className="font-medium text-white">{item.label}</span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-[#607B8F]/50 space-y-3">
        <button className="flex items-center space-x-3 p-3 rounded-xl bg-[#607B8F] border-2 border-transparent hover:bg-[#E97F4A] transition w-full text-left text-white">
          <Settings size={20} />
          {!collapsed && <span>Settings</span>}
        </button>

        <button className="flex items-center space-x-3 p-3 rounded-xl bg-[#607B8F] border-2 border-transparent hover:bg-[#E97F4A] transition w-full text-left text-white">
          <User size={20} />
          {!collapsed && <span>{username}</span>}
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center space-x-3 p-3 rounded-xl bg-red-500/80 border-2 border-transparent hover:bg-red-600 transition w-full text-left text-white"
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
