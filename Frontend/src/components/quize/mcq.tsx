import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  CheckCircle,
  ArrowLeft,
  Clock,
  AlertCircle,
} from "lucide-react";

// 1. Define the structure of the incoming API data
interface BackendQuestion {
  question: string;
  options: string[];
  answer: string; // Backend sends "a", "b", "c", "d"
  explanation: string;
  User_response: string;
}

interface MCQQuizPageProps {
  onBack: () => void;
  totalTimeSeconds?: number;
  data?: {
    quiz: BackendQuestion[];
  } | null;
}

type QStatus = "notVisited" | "visited" | "answered" | "markedForReview";

interface QuestionItem {
  id: number;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  selected?: string | null;
  status?: QStatus;
}

// Helper to convert 'a' -> options[0]
const mapBackendAnswerToText = (key: string, options: string[]) => {
  const map: Record<string, number> = { a: 0, b: 1, c: 2, d: 3 };
  const idx = map[key.toLowerCase()] ?? -1;
  return idx >= 0 && idx < options.length ? options[idx] : "";
};

const formatTime = (seconds: number) => {
  const mm = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const ss = (seconds % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
};

const MCQQuizPage: React.FC<MCQQuizPageProps> = ({
  onBack,
  totalTimeSeconds = 15 * 60,
  data,
}) => {
  // 3. Initialize state
  const [questions, setQuestions] = useState<QuestionItem[]>(() => {
    if (data && data.quiz && data.quiz.length > 0) {
      return data.quiz.map((q, idx) => ({
        id: idx + 1,
        question: q.question,
        options: q.options,
        answer: mapBackendAnswerToText(q.answer, q.options),
        explanation: q.explanation,
        selected: null,
        status: idx === 0 ? "visited" : "notVisited",
      }));
    }
    return [];
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [timeLeft, setTimeLeft] = useState(totalTimeSeconds);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex] || {
    id: 0,
    question: "Loading...",
    options: [],
    answer: "",
    status: "notVisited",
  };

  // Timer
  useEffect(() => {
    if (showScore) return;
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, showScore]);

  // Handle Selection (Just select, don't validate yet)
  const handleAnswerClick = useCallback(
    (option: string) => {
      setQuestions((prev) =>
        prev.map((q, idx) =>
          idx === currentIndex
            ? { ...q, selected: option, status: "answered" } // Mark as answered locally
            : q
        )
      );
    },
    [currentIndex]
  );

  const goToQuestion = useCallback(
    (index: number) => {
      setQuestions((prev) =>
        prev.map((q, idx) => {
          // If leaving a question that wasn't answered and wasn't marked for review, mark as visited (red)
          if (idx === currentIndex) {
            // Keep existing status if answered or marked
            if (q.status === "answered" || q.status === "markedForReview")
              return q;
            return { ...q, status: "visited" };
          }
          return q;
        })
      );
      setCurrentIndex(index);
    },
    [currentIndex]
  ); // Added currentIndex dependency

  const handleSaveAndNext = useCallback(() => {
    // Logic handled in goToQuestion essentially, but we ensure status update
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx === currentIndex) {
          return {
            ...q,
            status:
              q.status === "markedForReview"
                ? "markedForReview"
                : q.selected
                ? "answered"
                : "visited",
          };
        }
        return q;
      })
    );

    const next = currentIndex + 1;
    if (next < totalQuestions) {
      goToQuestion(next);
    } else {
      // Last question
      handleSubmit();
    }
  }, [currentIndex, goToQuestion, totalQuestions]); // Added dependencies

  const handleMarkForReview = useCallback(() => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === currentIndex ? { ...q, status: "markedForReview" } : q
      )
    );
    const next = currentIndex + 1;
    if (next < totalQuestions) goToQuestion(next);
  }, [currentIndex, goToQuestion, totalQuestions]);

  const handleClearResponse = useCallback(() => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === currentIndex ? { ...q, selected: null, status: "visited" } : q
      )
    );
  }, [currentIndex]);

  const computeScore = useCallback(() => {
    let s = 0;
    questions.forEach((q) => {
      if (q.selected === q.answer) s += 1;
    });
    return s;
  }, [questions]);

  const handleSubmit = useCallback(() => {
    setShowScore(true);
  }, []);

  const handleAutoSubmit = useCallback(() => {
    setShowScore(true);
  }, []);

  // Palette Status Colors
  const statusClassForPalette = (q: QuestionItem, idx: number) => {
    const isActive = idx === currentIndex;
    const baseClass =
      "w-full aspect-square rounded-md flex items-center justify-center font-bold text-sm transition-all border-2";

    // Active Border Highlight (Yellow)
    const borderClass = isActive
      ? "border-[#F7E396] shadow-[0_0_10px_#F7E396]"
      : "border-transparent";

    let bgClass = "";
    switch (q.status) {
      case "answered":
        bgClass = "bg-green-500 text-white";
        break;
      case "markedForReview":
        bgClass = "bg-yellow-400 text-[#434E78]";
        break;
      case "visited":
        bgClass = "bg-red-500 text-white"; // Visited but skipped
        break;
      default:
        bgClass = "bg-[#434E78]/50 text-gray-400"; // Not visited
    }

    return `${baseClass} ${bgClass} ${borderClass}`;
  };

  const score = useMemo(() => computeScore(), [questions, computeScore]);

  // --- RENDER SCORE ---
  if (showScore) {
    return (
      <div className="min-h-screen bg-[#434E78] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#F7E396] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-[#607B8F] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob animation-delay-2000 pointer-events-none"></div>

        <div className="w-full max-w-2xl p-10 bg-[#607B8F] rounded-2xl shadow-2xl text-center border border-white/10 relative z-10">
          <CheckCircle className="w-20 h-20 text-[#F7E396] mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-2 text-white font-handwriting">
            Test Complete
          </h2>
          <p className="text-gray-200 mb-8">
            You have successfully submitted the quiz.
          </p>

          <div className="text-center mb-10 p-6 bg-[#434E78]/50 rounded-xl border border-white/10">
            <div className="text-sm text-gray-300 uppercase tracking-widest mb-2">
              Your Score
            </div>
            <div className="text-6xl font-extrabold text-[#F7E396] drop-shadow-md">
              {score}
            </div>
            <div className="text-lg text-gray-300 mt-2">
              out of {totalQuestions}
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={onBack}
              className="px-8 py-4 rounded-xl bg-[#F7E396] text-[#434E78] font-bold hover:bg-[#E97F4A] hover:text-white transition shadow-lg flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Generator
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#434E78] text-gray-300">
        No questions available. Please try generating again.
        <button
          onClick={onBack}
          className="ml-4 text-[#F7E396] underline hover:text-[#E97F4A]"
        >
          Go Back
        </button>
      </div>
    );
  }

  // --- MAIN QUIZ UI ---
  return (
    <div className="min-h-screen bg-[#434E78] text-white p-4 lg:p-8 font-sans relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#F7E396] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-[#607B8F] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob animation-delay-2000 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 h-full">
        {/* Left: Main Question area */}
        <div className="col-span-12 lg:col-span-8 flex flex-col">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center text-gray-300 hover:text-[#F7E396] transition"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Exit Quiz
            </button>
            <div className="hidden md:block text-[#F7E396] font-bold text-lg bg-[#607B8F] px-4 py-1 rounded-full border border-white/10 shadow-sm">
              Question {currentIndex + 1} / {totalQuestions}
            </div>
          </div>

          <div className="bg-[#607B8F] rounded-2xl shadow-xl p-8 mb-6 border border-white/10 flex-1 flex flex-col">
            <div className="mb-8">
              <h2 className="text-xl lg:text-2xl font-bold text-white leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="grid gap-4 flex-1 content-start">
              {currentQuestion.options.map((opt, i) => {
                const isSelected = currentQuestion.selected === opt;

                // Styling: Only show selection state, NOT correctness
                let optionClass =
                  "bg-[#434E78]/40 border border-white/10 text-gray-200 hover:bg-[#434E78]/60";

                if (isSelected) {
                  // Active selection styling
                  optionClass =
                    "bg-[#F7E396] text-[#434E78] border-[#F7E396] font-bold shadow-md transform scale-[1.01]";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswerClick(opt)}
                    className={`p-5 rounded-xl text-left transition-all duration-200 flex justify-between items-center group ${optionClass}`}
                  >
                    <span className="text-lg">{opt}</span>
                    {/* Circle Indicator */}
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center
                        ${
                          isSelected
                            ? "border-[#434E78]"
                            : "border-gray-400 group-hover:border-[#F7E396]"
                        }
                    `}
                    >
                      {isSelected && (
                        <div className="w-3 h-3 rounded-full bg-[#434E78]"></div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom actions */}
            <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={handleMarkForReview}
                  className="flex-1 md:flex-none px-6 py-3 rounded-lg bg-yellow-400 text-[#434E78] font-bold hover:bg-yellow-300 transition shadow-md"
                >
                  Mark for Review
                </button>
                <button
                  onClick={handleClearResponse}
                  disabled={!currentQuestion.selected}
                  className="flex-1 md:flex-none px-6 py-3 rounded-lg border border-gray-400 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Clear Selection
                </button>
              </div>

              <button
                onClick={handleSaveAndNext}
                className="w-full md:w-auto px-8 py-3 rounded-lg bg-[#F7E396] text-[#434E78] font-bold hover:bg-[#E97F4A] hover:text-white transition shadow-lg flex items-center justify-center gap-2"
              >
                {currentIndex === totalQuestions - 1
                  ? "Submit Quiz"
                  : "Save & Next"}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Sidebar */}
        <aside className="col-span-12 lg:col-span-4">
          <div className="sticky top-6 space-y-6">
            {/* Timer Card */}
            <div className="bg-[#607B8F] rounded-2xl p-6 shadow-xl border border-white/10 text-center relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 text-gray-300 mb-2">
                  <Clock className="w-4 h-4" /> Time Remaining
                </div>
                <div className="text-5xl font-mono font-bold text-[#F7E396] tracking-wider">
                  {formatTime(Math.max(0, timeLeft))}
                </div>
              </div>
            </div>

            {/* Palette Card */}
            <div className="bg-[#607B8F] rounded-2xl p-6 shadow-xl border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
                Question Palette
              </h3>

              <div className="grid grid-cols-5 gap-3">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(idx)}
                    className={statusClassForPalette(q, idx)}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-6 grid grid-cols-2 gap-y-3 gap-x-2 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>{" "}
                  Answered
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-sm"></div> Skipped
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div>{" "}
                  Review
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#434E78]/50 rounded-sm border border-gray-500"></div>{" "}
                  Not Visited
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to submit the test?"))
                  handleSubmit();
              }}
              className="w-full px-6 py-4 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition shadow-lg flex items-center justify-center gap-2"
            >
              <AlertCircle className="w-5 h-5" /> Submit Test
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MCQQuizPage;
