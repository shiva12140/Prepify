import React, { useState, useRef } from "react";
import {
  FileSpreadsheet,
  ListChecks,
  Upload,
  X,
  Loader2,
  Clock,
  FileText,
  ChevronRight,
  Brain,
} from "lucide-react";
import MCQQuizPage from "../components/quize/mcq";
import API from "../api/api";
import * as pdfjsLib from "pdfjs-dist";

// Initialize PDF worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const ResumeGeneratedQuize: React.FC = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizType, setQuizType] = useState<"mcq" | null>("mcq");
  const [uploadType, setUploadType] = useState<"resume" | "notes" | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Configuration State
  const [customPrompt, setCustomPrompt] = useState("");
  const [duration, setDuration] = useState(15);
  const [quizData, setQuizData] = useState(null);

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const notesInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "resume" | "notes"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setFileError("Please upload a PDF file");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError(
        `File size exceeds 10MB. Your file is ${(
          file.size /
          (1024 * 1024)
        ).toFixed(2)}MB`
      );
      return;
    }

    setFileError(null);
    setUploadType(type);
    setUploadedFile(file.name);
    setFileObject(file);
  };

  const handleResumeClick = () => resumeInputRef.current?.click();
  const handleNotesClick = () => notesInputRef.current?.click();

  const clearUpload = () => {
    setUploadedFile(null);
    setUploadType(null);
    setFileError(null);
    setFileObject(null);
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n";
    }
    return fullText;
  };

  const generateQuiz = async () => {
    if (!fileObject || !quizType || !uploadType) return;

    setIsProcessing(true);
    setFileError(null);

    try {
      console.log("Extracting text from PDF...");
      const extractedText = await extractTextFromPDF(fileObject);

      if (!extractedText.trim()) {
        throw new Error(
          "Could not extract text from the PDF. It might be an image-only PDF."
        );
      }

      const payload = {
        parsed_doc: extractedText.trim(),
        user_prompt:
          customPrompt.trim() || "Generate a quiz based on this content.",
      };

      const endpoint = uploadType === "notes" ? "/quiz/notes" : "/quiz/resume";

      console.log(`Sending to ${endpoint}...`);

      const response = await API.post(endpoint, payload);
      setQuizData(response.data);
      setShowQuiz(true);
    } catch (error: any) {
      console.error("Quiz Generation Error:", error);
      let errorMessage = "Failed to generate quiz. Check login status.";
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === "string") {
          errorMessage = error.response.data.detail;
        } else if (
          Array.isArray(error.response.data.detail) &&
          error.response.data.detail.length > 0
        ) {
          const firstError = error.response.data.detail[0];
          errorMessage = `Validation Error: Field '${firstError.loc.join(
            " -> "
          )}' ${firstError.msg}`;
        }
      } else if (error.code === "ERR_BAD_REQUEST") {
        errorMessage = "Server rejected the data. Are you logged in?";
      }
      setFileError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (showQuiz) {
    return (
      <MCQQuizPage
        data={quizData}
        onBack={() => setShowQuiz(false)}
        totalTimeSeconds={duration * 60}
      />
    );
  }

  // ---- UI COMPONENTS ----

  const OutputTypeOption = ({ icon, title, desc, value }: any) => (
    <div
      onClick={() => setQuizType(value)}
      className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-2 group h-full
        ${
          quizType === value
            ? "bg-[#607B8F] border-[#F7E396] shadow-lg transform scale-[1.01]"
            : "bg-[#607B8F]/50 border-transparent hover:bg-[#607B8F] hover:border-[#E97F4A]/50"
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-1.5 rounded-lg ${
            quizType === value
              ? "bg-[#F7E396] text-[#434E78]"
              : "bg-[#434E78]/50 text-[#F7E396]"
          }`}
        >
          {icon}
        </div>
        <h4
          className={`text-sm font-bold ${
            quizType === value
              ? "text-[#F7E396]"
              : "text-white group-hover:text-[#F7E396]"
          }`}
        >
          {title}
        </h4>
      </div>
      <p className="text-gray-300 text-xs leading-relaxed">{desc}</p>
    </div>
  );

  return (
    // FIXED: h-screen + overflow-hidden to fix double scrollbars.
    <div className="w-full h-screen bg-[#434E78] text-white relative font-sans overflow-hidden flex flex-col">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#F7E396] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-[#607B8F] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-blob animation-delay-2000 pointer-events-none"></div>

      {/* Main Content Wrapper - Added 'pt-6' to fix header cut-off */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 pt-8 lg:pt-12 w-full z-10 flex flex-col items-center">
        <div className="max-w-6xl w-full flex flex-col h-full">
          {/* Header - Compacted margins */}
          <div className="text-center mb-6 shrink-0 mt-2">
            <h1 className="text-3xl font-bold mb-2 font-handwriting drop-shadow-md">
              Smart AI-Powered Quiz Generator
            </h1>
            <div className="flex items-center justify-center gap-2 text-[#F7E396] text-sm">
              <Brain className="w-5 h-5" />
              <span className="font-semibold tracking-wide">
                Generate Quizzes from Resumes or Notes
              </span>
            </div>
          </div>

          {/* Content Grid - Compacted spacing */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start flex-1">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              {/* 1. Source Card - Compact Padding (p-5) */}
              <div className="bg-[#607B8F] rounded-2xl shadow-xl border border-white/10 p-5">
                <div className="flex items-center gap-3 mb-3 border-b border-white/10 pb-3">
                  <FileSpreadsheet className="w-5 h-5 text-[#F7E396]" />
                  <h3 className="text-lg font-bold text-white">
                    1. Select Quiz Source
                  </h3>
                </div>

                <div className="space-y-3">
                  <p className="text-gray-200 text-xs">
                    Upload your material (Max 10MB PDF).
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={handleResumeClick}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md text-sm
                        ${
                          uploadType === "resume"
                            ? "bg-[#F7E396] text-[#434E78] ring-2 ring-white"
                            : "bg-[#434E78] text-white hover:bg-[#E97F4A]"
                        }`}
                    >
                      <Upload className="w-4 h-4" />
                      Resume
                    </button>

                    <button
                      onClick={handleNotesClick}
                      className={`flex-1 py-2.5 px-4 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md text-sm
                        ${
                          uploadType === "notes"
                            ? "bg-[#F7E396] text-[#434E78] ring-2 ring-white"
                            : "bg-[#434E78] text-white hover:bg-[#E97F4A]"
                        }`}
                    >
                      <Upload className="w-4 h-4" />
                      Notes
                    </button>
                  </div>

                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload(e, "resume")}
                    className="hidden"
                  />
                  <input
                    ref={notesInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload(e, "notes")}
                    className="hidden"
                  />

                  {fileError && (
                    <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-xs">
                      {fileError}
                    </div>
                  )}

                  {uploadedFile && (
                    <div className="p-3 bg-[#434E78]/50 border border-[#F7E396]/50 rounded-lg flex items-center justify-between">
                      <div className="overflow-hidden">
                        <p className="text-[#F7E396] font-semibold text-xs">
                          File Uploaded
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <FileText className="w-3 h-3 text-gray-300" />
                          <span className="text-white text-xs truncate block">
                            {uploadedFile}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={clearUpload}
                        className="text-gray-400 hover:text-white p-1 shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Output Type Selection */}
              <div className="bg-[#607B8F] rounded-2xl shadow-xl border border-white/10 p-5">
                <div className="flex items-center gap-3 mb-3 border-b border-white/10 pb-3">
                  <ListChecks className="w-5 h-5 text-[#F7E396]" />
                  <h3 className="text-lg font-bold text-white">
                    2. Choose Output Type
                  </h3>
                </div>

                <div className="grid grid-cols-1">
                  <OutputTypeOption
                    value="mcq"
                    icon={<ListChecks className="w-5 h-5" />}
                    title="Multiple Choice Quiz (MCQ)"
                    desc="Generate a standardized multiple-choice assessment."
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Configuration */}
            <div className="lg:col-span-5 flex flex-col h-full">
              <div className="bg-[#607B8F] rounded-2xl shadow-xl border border-white/10 p-5 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-3 border-b border-white/10 pb-3 shrink-0">
                  <Clock className="w-5 h-5 text-[#F7E396]" />
                  <h3 className="text-lg font-bold text-white">3. Configure</h3>
                </div>

                <div className="flex-1 flex flex-col gap-4">
                  {/* Custom Prompt - Reduced height */}
                  <div className="flex-1 flex flex-col min-h-0">
                    <label className="text-[#F7E396] font-bold block mb-2 text-xs tracking-wide">
                      Custom Instructions (Optional)
                    </label>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="e.g., 'Focus on React hooks...'"
                      // Reduced min-height to 100px for compactness
                      className="w-full flex-1 p-3 rounded-lg bg-[#434E78]/50 border-2 border-transparent focus:border-[#F7E396] focus:ring-0 outline-none transition text-white placeholder-gray-400 resize-none shadow-inner text-sm min-h-[100px]"
                    ></textarea>
                  </div>

                  {/* Duration Slider */}
                  <div className="shrink-0 pt-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-[#F7E396] font-bold text-xs tracking-wide">
                        Quiz Duration
                      </label>
                      <span className="bg-[#434E78] px-2 py-1 rounded-full text-white text-xs font-bold border border-white/10">
                        {duration} min
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="60"
                      step="1"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#434E78] rounded-lg appearance-none cursor-pointer accent-[#F7E396]"
                    />
                    <div className="flex justify-between text-xs text-gray-300 mt-1 font-medium">
                      <span>5m</span>
                      <span>30m</span>
                      <span>60m</span>
                    </div>
                  </div>

                  {/* Action Button - Reduced height */}
                  <button
                    onClick={generateQuiz}
                    disabled={!quizType || !fileObject || isProcessing}
                    className={`w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all transform hover:-translate-y-1 shadow-lg shrink-0 mt-2
                        ${
                          !quizType || !fileObject || isProcessing
                            ? "bg-gray-500 text-gray-300 cursor-not-allowed opacity-50"
                            : "bg-[#F7E396] text-[#434E78] hover:bg-[#E97F4A] hover:text-white"
                        }
                      `}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin w-5 h-5" />{" "}
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate Quiz <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeGeneratedQuize;
