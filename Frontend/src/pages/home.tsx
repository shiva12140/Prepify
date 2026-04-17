import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Zap,
  Target,
  Clock,
  Award,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import AuthModal from "../components/auth/AuthModal";
import SignIn from "../components/auth/SignIn";
import SignUp from "../components/auth/SignUp";
import { SplineScene } from "../components/ui/splite";
import { Spotlight } from "../components/ui/spotlight";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Step {
  step: string;
  title: string;
  desc: string;
}

// ✅ UPDATED: Interface now accepts token
interface AIInterviewPlatformProps {
  onLogin: (username: string, token: string) => void;
}

const AIInterviewPlatform: React.FC<AIInterviewPlatformProps> = ({
  onLogin,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [modalType, setModalType] = useState<"none" | "signIn" | "signUp">(
    "none"
  );

  // Handlers for opening/closing modals
  const openSignInModal = () => {
    setModalType("signIn");
    setIsMenuOpen(false);
  };

  const openSignUpModal = () => {
    setModalType("signUp");
    setIsMenuOpen(false);
  };

  const closeModal = () => setModalType("none");

  // ✅ UPDATED: Handler now accepts and passes token
  const handleAuthSuccess = (username: string, token: string) => {
    closeModal();
    onLogin(username, token);
  };

  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features: Feature[] = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI-Powered Questions",
      description: "Dynamic questions that adapt to your skill level, role, and experience",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Voice-Based Interviews",
      description: "Talk naturally with an AI interviewer — just like the real thing",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Smart Notes & PDF Chat",
      description: "Upload your study material and chat with it using AI",
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Resume-Based Quizzes",
      description: "Auto-generate MCQs from your resume to find weak spots",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Performance Dashboard",
      description: "Track your streaks, scores, and improvement over time",
    },
  ];

  const steps: Step[] = [
    {
      step: "01",
      title: "Sign Up & Upload",
      desc: "Create your account and upload your resume or study notes",
    },
    {
      step: "02",
      title: "Practice & Learn",
      desc: "Take AI mock interviews or chat with your notes",
    },
    {
      step: "03",
      title: "Review & Improve",
      desc: "Get detailed feedback and track your progress on the dashboard",
    },
  ];

  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#1A2517] to-[#2D3B28] text-white overflow-x-hidden font-opensans">
      {/* Navigation Bar */}
      <nav
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#1A2517]/95 backdrop-blur-md shadow-xl"
            : "bg-[#1A2517]/80 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-[#ACC8A2] to-[#7BA370] p-2 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-br from-[#ACC8A2] to-[#7BA370] bg-clip-text text-transparent">
                Prepify
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <a
                href="#home"
                className="text-gray-200 hover:text-[#ACC8A2] transition-colors font-medium"
              >
                Home
              </a>
              <a
                href="#about"
                className="text-gray-200 hover:text-[#ACC8A2] transition-colors font-medium"
              >
                About
              </a>
              <a
                href="#features"
                className="text-gray-200 hover:text-[#ACC8A2] transition-colors font-medium"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-200 hover:text-[#ACC8A2] transition-colors font-medium"
              >
                How It Works
              </a>
              <button
                onClick={openSignInModal}
                className="px-6 py-2.5 rounded-lg border-2 border-[#ACC8A2] text-[#ACC8A2] hover:bg-[#ACC8A2]/10 transition-all font-medium"
              >
                Sign In
              </button>
              <button
                onClick={openSignUpModal}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-br from-[#7BA370] to-[#ACC8A2] hover:from-[#6B9360] hover:to-[#9CB892] transition-all shadow-lg shadow-[#ACC8A2]/30 font-medium"
              >
                Sign Up
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-[#1A2517]/98 backdrop-blur-md">
            <div className="px-4 py-4 space-y-3 max-w-7xl mx-auto">
              <a
                href="#home"
                className="block py-3 px-4 rounded-lg text-gray-200 hover:bg-[#ACC8A2]/10 hover:text-[#ACC8A2] transition-all font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </a>
              <a
                href="#about"
                className="block py-3 px-4 rounded-lg text-gray-200 hover:bg-[#ACC8A2]/10 hover:text-[#ACC8A2] transition-all font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </a>
              <a
                href="#features"
                className="block py-3 px-4 rounded-lg text-gray-200 hover:bg-[#ACC8A2]/10 hover:text-[#ACC8A2] transition-all font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block py-3 px-4 rounded-lg text-gray-200 hover:bg-[#ACC8A2]/10 hover:text-[#ACC8A2] transition-all font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </a>
              <button
                onClick={openSignInModal}
                className="w-full py-3 rounded-lg border-2 border-[#ACC8A2] text-[#ACC8A2] hover:bg-[#ACC8A2]/10 transition-all font-medium"
              >
                Sign In
              </button>
              <button
                onClick={openSignUpModal}
                className="w-full py-3 rounded-lg bg-gradient-to-br from-[#7BA370] to-[#ACC8A2] hover:from-[#6B9360] hover:to-[#9CB892] transition-all font-medium"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modals */}
      <AuthModal isOpen={modalType === "signIn"} onClose={closeModal}>
        <SignIn
          onSwitchToSignUp={openSignUpModal}
        />
      </AuthModal>

      <AuthModal isOpen={modalType === "signUp"} onClose={closeModal}>
        <SignUp
          onClose={closeModal}
          onSwitchToSignIn={openSignInModal}
          onAuthSuccess={handleAuthSuccess}
        />
      </AuthModal>

      {/* Hero Section */}
      <section
        ref={heroRef}
        id="home"
        className="min-h-[calc(100vh-68px)] flex items-center pt-20 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-black"
      >
        <Spotlight parentRef={heroRef} className="mix-blend-screen" />
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side */}
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Master Your Next{" "}
                <span className="block bg-gradient-to-br from-[#ACC8A2] via-[#7BA370] to-[#ACC8A2] bg-clip-text text-transparent">
                  Interview with AI
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-10 max-w-lg">
                Practice with our intelligent AI interviewer, get instant
                feedback, and land your dream job with confidence.
              </p>
              <button
                onClick={openSignUpModal}
                className="px-8 py-4 rounded-xl bg-gradient-to-br from-[#7BA370] to-[#ACC8A2] hover:from-[#6B9360] hover:to-[#9CB892] transition duration-300 shadow-xl shadow-[#ACC8A2]/30 flex items-center gap-2 text-lg font-semibold transform hover:scale-[1.03] text-[#1A2517]"
              >
                Get Started Free <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Right side - 3D Scene */}
            <div className="h-[500px] lg:h-[600px] relative">
              <SplineScene
                scene="https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode"
                className="w-full h-full"
              />
              {/* Bottom gradient to blend robot base into background */}
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#1A2517]/60">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                About Prepify
              </h2>
              <p className="text-lg text-gray-300 mb-6">
                Prepify was built with one mission — to make interview prep
                accessible, smart, and stress-free for every student and
                job-seeker out there.
              </p>
              <p className="text-lg text-gray-300 mb-6">
                Whether you're a fresher stepping into your first placement
                season or an experienced professional switching roles, Prepify
                gives you an AI-powered coach that adapts to your skill level
                and helps you build real confidence.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#ACC8A2] rounded-full"></div>
                  <span className="text-gray-300">
                    Voice-based mock interviews with real-time feedback
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#7BA370] rounded-full"></div>
                  <span className="text-gray-300">
                    Upload notes & PDFs to study smarter with AI chat
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#ACC8A2] rounded-full"></div>
                  <span className="text-gray-300">
                    Auto-generated quizzes tailored to your resume
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#1A2517]/50 to-[#2D3B28]/50 rounded-2xl p-8 border border-[#ACC8A2]/20">
              <div className="space-y-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-[#ACC8A2] mb-2">
                    2025
                  </div>
                  <div className="text-gray-400">Launched</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-[#7BA370] mb-2">
                    AI-First
                  </div>
                  <div className="text-gray-400">Built for the AI Era</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
                  <div className="text-3xl font-bold text-[#ACC8A2] mb-2">
                    100%
                  </div>
                  <div className="text-gray-400">Free to Get Started</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Why Choose Prepify?
            </h2>
            <p className="text-xl text-gray-400">
              Your all-in-one toolkit for cracking interviews and acing exams
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature: Feature, index: number) => (
              <div
                key={index}
                className="bg-gradient-to-br from-[#1A2517]/50 to-[#2D3B28]/50 backdrop-blur-sm rounded-xl p-8 border border-[#ACC8A2]/20 hover:border-[#ACC8A2]/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="bg-gradient-to-br from-[#ACC8A2] to-[#7BA370] w-16 h-16 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-[#ACC8A2]/30">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#1A2517]/50 to-[#2D3B28]/50 rounded-2xl border border-[#ACC8A2]/15"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400">
              Get started in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item: Step, index: number) => (
              <div key={index} className="relative text-center">
                <div className="text-7xl font-bold text-[#ACC8A2]/20 mb-4">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
                {index < 2 && (
                  <ChevronRight className="hidden md:block absolute top-12 -right-12 w-8 h-8 text-[#ACC8A2]/40" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Ace Your Interview?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join students and professionals who are leveling up with
            Prepify
          </p>
          <button
            onClick={openSignUpModal}
            className="px-10 py-5 rounded-lg bg-gradient-to-r from-[#7BA370] to-[#ACC8A2] hover:from-[#6B9360] hover:to-[#9CB892] transition shadow-lg shadow-[#ACC8A2]/30 text-lg font-semibold text-[#1A2517]"
          >
            Start Your Free Trial Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 px-6 bg-[#1A2517]/95 backdrop-blur-md text-gray-200 flex flex-col sm:flex-row items-center justify-between shadow-inner border-t border-[#ACC8A2]/10">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-[#ACC8A2] to-[#7BA370] p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} Prepify — All rights reserved
          </p>
        </div>
        <div className="flex items-center gap-5 mt-4 sm:mt-0">
          <a href="https://github.com/shiva12140/propears" target="_blank" rel="noopener noreferrer" className="hover:text-[#ACC8A2] transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-current"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <a href="https://www.linkedin.com/in/aadipratapsingh" target="_blank" rel="noopener noreferrer" className="hover:text-[#ACC8A2] transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-current"
            >
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
};

export default AIInterviewPlatform;
