import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { getNoteContentUrl } from "../api/notesService";
import SecurePdfViewer from "../components/SecurePdfViewer"; // <--- Imported new component
import {
  Upload,
  Menu,
  X,
  Send,
  Loader2,
  FileText,
  MessageSquare,
  GripVertical,
  Trash2,
  Edit2,
  Check,
  Brain,
} from "lucide-react";
import {
  fetchNotes,
  uploadNote,
  // fetchNoteBlob, // Not needed as the component handles the fetch
  createChatSession,
  streamChatRequest,
  fetchChatHistory,
  fetchSessions,
  deleteNote,
  renameNote,
  type Note,
  type ChatMessage,
} from "../api/notesService";

const Notes: React.FC = () => {
  // --- UI State ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Resizable Chat State ---
  const [chatWidth, setChatWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);

  // --- Data State ---
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  // const [pdfUrl, setPdfUrl] = useState<string | null>(null); // <--- REMOVED

  // --- Edit/Rename State ---
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  // --- Chat State ---
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // --- Auto Scroll Ref ---
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  // --- Robust Auto-Scroll ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "instant",
      block: "end",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatLoading]);

  // --- Resizing Logic ---
  const startResizing = useCallback(() => setIsResizing(true), []);
  const stopResizing = useCallback(() => setIsResizing(false), []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing) {
        const newWidth = document.body.clientWidth - mouseMoveEvent.clientX;
        if (newWidth > 300 && newWidth < 800) setChatWidth(newWidth);
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  const loadNotes = async () => {
    try {
      const data = await fetchNotes();
      setNotes(data);
    } catch (error) {
      console.error("Failed to load notes", error);
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const newNote = await uploadNote(file);
      setNotes([newNote, ...notes]);
      handleNoteSelect(newNote);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload PDF");
    } finally {
      setIsUploading(false);
    }
  };

  // --- Handle Delete ---
  const handleDeleteNote = async (e: React.MouseEvent, noteId: number) => {
    e.stopPropagation();
    if (
      !window.confirm(
        "Are you sure you want to delete this note and its chat history?"
      )
    )
      return;

    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (currentNote?.id === noteId) {
        setCurrentNote(null);
        // setPdfUrl(null); // <--- REMOVED
        setMessages([]);
        setSessionId(null);
      }
    } catch (error) {
      console.error("Failed to delete note", error);
      alert("Error deleting note");
    }
  };

  // --- Handle Rename ---
  const startEditing = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    setEditingNoteId(note.id);
    setEditName(note.filename);
  };

  const saveRename = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editingNoteId || !editName.trim()) return;

    try {
      await renameNote(editingNoteId, editName);
      setNotes((prev) =>
        prev.map((n) =>
          n.id === editingNoteId ? { ...n, filename: editName } : n
        )
      );
      if (currentNote?.id === editingNoteId) {
        setCurrentNote((prev) =>
          prev ? { ...prev, filename: editName } : null
        );
      }
      setEditingNoteId(null);
    } catch (error) {
      console.error("Failed to rename", error);
      alert("Error renaming note");
    }
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNoteId(null);
  };

  const handleNoteSelect = async (note: Note) => {
    if (editingNoteId === note.id) return;
    setCurrentNote(note);
    setMessages([]);
    setSessionId(null);
    setIsChatOpen(true);

    // --- PDF VIEWER LOGIC ---
    // We no longer set pdfUrl state or append the token here.
    // The SecurePdfViewer component handles the authenticated fetch internally
    // using the currentNote.id prop.

    try {
      const existingSessions = await fetchSessions(note.id);
      if (existingSessions.length > 0) {
        const lastSession = existingSessions[0];
        setSessionId(lastSession.id);
        const history = await fetchChatHistory(lastSession.id);
        const formattedHistory: ChatMessage[] = history.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        }));
        setMessages(formattedHistory);
      } else {
        const session = await createChatSession(
          note.id,
          `Chat - ${note.filename}`
        );
        setSessionId(session.id);
        setMessages([
          {
            role: "assistant",
            content: `Ready to chat about ${note.filename}!`,
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to init chat", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return;
    const userMsg = inputMessage;
    setInputMessage("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsChatLoading(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    try {
      await streamChatRequest(
        sessionId,
        userMsg,
        (chunk) => {
          setMessages((prev) => {
            const newArr = [...prev];
            const lastIndex = newArr.length - 1;
            newArr[lastIndex] = {
              ...newArr[lastIndex],
              content: newArr[lastIndex].content + chunk,
            };
            return newArr;
          });
        },
        (err) => console.error("Stream error", err)
      );
    } catch (e) {
      console.error("Chat Request Error", e);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    // 1. Root Container: #434E78 Background, No Scrollbars
    <div className="flex h-screen w-full overflow-hidden bg-[#434E78] font-sans text-white">
      {/* --- Left Sidebar (#607B8F) --- */}
      <div
        className={`h-screen shrink-0 transition-all duration-300 bg-[#607B8F] border-r border-white/10 flex flex-col gap-4 ${
          isSidebarOpen ? "w-72 p-4" : "w-0 p-0 overflow-hidden"
        }`}
      >
        {isSidebarOpen && (
          <>
            <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-4">
              <FileText className="text-[#F7E396] w-6 h-6" />
              <h3 className="text-xl font-bold text-white font-handwriting">
                My Notes
              </h3>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="application/pdf"
              onChange={handleFileChange}
            />

            {/* Upload Button: #F7E396 (Highlight) */}
            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="flex items-center justify-center gap-2 w-full bg-[#F7E396] text-[#434E78] px-4 py-3 rounded-xl hover:bg-[#E97F4A] hover:text-white transition font-bold shadow-md"
            >
              {isUploading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Upload size={20} />
              )}
              {isUploading ? "Uploading..." : "Upload New PDF"}
            </button>

            <div className="mt-2 flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              <p className="text-xs text-gray-200 uppercase tracking-widest font-semibold mb-2">
                History
              </p>

              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => handleNoteSelect(note)}
                  className={`group relative p-3 rounded-lg cursor-pointer flex items-center justify-between transition-all border border-transparent ${
                    currentNote?.id === note.id
                      ? "bg-[#434E78] border-[#F7E396] shadow-md"
                      : "hover:bg-[#434E78]/50 text-gray-100"
                  }`}
                >
                  {editingNoteId === note.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-[#434E78] text-white text-xs px-2 py-1 rounded border border-[#F7E396] outline-none"
                        autoFocus
                      />
                      <button
                        onClick={saveRename}
                        className="text-green-300 hover:text-green-200 p-1"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={cancelRename}
                        className="text-red-300 hover:text-red-200 p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText
                          size={16}
                          className={`${
                            currentNote?.id === note.id
                              ? "text-[#F7E396]"
                              : "text-gray-300"
                          } shrink-0`}
                        />
                        <span
                          className={`truncate text-sm font-medium ${
                            currentNote?.id === note.id
                              ? "text-white"
                              : "text-gray-200"
                          }`}
                        >
                          {note.filename}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => startEditing(e, note)}
                          className="p-1.5 hover:bg-white/10 rounded text-gray-300 hover:text-[#F7E396]"
                          title="Rename"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteNote(e, note.id)}
                          className="p-1.5 hover:bg-red-500/20 rounded text-gray-300 hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* --- Center: PDF Viewer (#434E78 Background) --- */}
      <div className="flex flex-1 overflow-hidden relative flex-col bg-[#434E78]">
        <header className="flex justify-between items-center p-4 border-b border-white/10 shrink-0 z-10 bg-[#434E78]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/10 text-white transition"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-bold text-white truncate max-w-md">
              {currentNote ? currentNote.filename : "Select a Note"}
            </h2>
          </div>
          {!isChatOpen && currentNote && (
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 bg-[#F7E396] text-[#434E78] hover:bg-[#E97F4A] hover:text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-md"
            >
              <MessageSquare size={18} /> Open Chat
            </button>
          )}
        </header>

        <div className="flex-1 w-full h-full relative p-4">
          {currentNote ? (
            <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              {/* FIX: Use the SecurePdfViewer component, passing the noteId */}
              <SecurePdfViewer noteId={currentNote.id} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400/50">
              <FileText size={80} className="mb-4 opacity-30" />
              <p className="text-lg font-medium">
                Select a PDF from the sidebar to view
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- Resizable Chat Panel (#607B8F) --- */}
      {isChatOpen && (
        <div
          className="w-1 hover:w-2 cursor-col-resize bg-[#434E78] hover:bg-[#F7E396] transition-all z-20 flex items-center justify-center shrink-0"
          onMouseDown={startResizing}
        >
          <GripVertical size={16} className="text-white/30" />
        </div>
      )}

      <div
        style={{ width: isChatOpen ? chatWidth : 0 }}
        className={`flex flex-col bg-[#607B8F] border-l border-white/10 shrink-0 transition-all duration-100 ease-linear overflow-hidden`}
      >
        {isChatOpen && (
          <>
            <header className="flex justify-between items-center p-4 border-b border-white/10 bg-[#607B8F] shrink-0">
              <div className="flex items-center gap-2">
                <Brain size={20} className="text-[#F7E396]" />
                <h3 className="text-lg font-bold text-white whitespace-nowrap font-handwriting">
                  AI Chat
                </h3>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-2 rounded-lg text-gray-200 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-center text-gray-200 mt-10 opacity-70">
                  <p>Ask a question about this document...</p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-xl text-sm shadow-sm ${
                      msg.role === "user"
                        ? "bg-[#F7E396] text-[#434E78] font-medium rounded-tr-none"
                        : "bg-[#434E78] text-white border border-white/10 rounded-tl-none prose prose-invert prose-sm max-w-none"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#434E78] p-3 rounded-lg border border-white/10">
                    <Loader2 className="animate-spin w-4 h-4 text-[#F7E396]" />
                  </div>
                </div>
              )}
              {/* Auto Scroll Anchor */}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/10 shrink-0 bg-[#607B8F]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your question..."
                  // Input: Dark Blue (#434E78) for contrast on Light Blue (#607B8F) panel
                  className="flex-1 bg-[#434E78] text-white rounded-xl px-4 py-3 border border-transparent focus:border-[#F7E396] focus:ring-0 outline-none placeholder-gray-400 shadow-inner"
                  disabled={!sessionId || isChatLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!sessionId || isChatLoading}
                  className="bg-[#F7E396] p-3 rounded-xl text-[#434E78] hover:bg-[#E97F4A] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Notes;
