import API from "./api"; // Your existing Axios instance
import { type AxiosResponse } from "axios";

// Interface matching the Backend Pydantic model "NoteInfo"
export interface Note {
  id: number;
  filename: string;
  created_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface Session {
  id: string;
  name: string;
  created_at: string;
  pdf_id: number;
}

// 1. Fetch the list of PDFs for the Sidebar
export const fetchNotes = async (): Promise<Note[]> => {
  const response: AxiosResponse<Note[]> = await API.get("/notes/");
  return response.data;
};

// 2. Upload a new PDF
export const uploadNote = async (file: File): Promise<Note> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await API.post("/notes/upload_notes", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return {
    id: response.data.doc_id,
    filename: response.data.filename,
    created_at: new Date().toISOString(),
  };
};

// 3. NEW: Delete a note
export const deleteNote = async (noteId: number) => {
  const response = await API.delete(`/notes/${noteId}`);
  return response.data;
};

// 4. NEW: Rename a note
export const renameNote = async (noteId: number, newName: string) => {
  const response = await API.put(`/notes/${noteId}`, { new_filename: newName });
  return response.data;
};

// 5. Get the URL for the PDF content (for the viewer)
export const getNoteContentUrl = (noteId: number): string => {
  return `/api/v1/notes/${noteId}/content`;
};

// 6. Fetch the Blob directly
export const fetchNoteBlob = async (noteId: number): Promise<Blob> => {
  const response = await API.get(`/notes/${noteId}/content`, {
    responseType: "blob",
  });
  return response.data;
};

// 7. Create or Get Chat Session
export const createChatSession = async (
  pdfId: number,
  name: string = "New Chat"
) => {
  const response = await API.post("/notes/sessions", { pdf_id: pdfId, name });
  return response.data;
};

// 8. Get Chat History
export const fetchChatHistory = async (sessionId: string) => {
  const response = await API.get(`/notes/history/${sessionId}`);
  return response.data;
};

export const fetchSessions = async (pdfId: number): Promise<Session[]> => {
  const response = await API.get(`/notes/sessions/${pdfId}`);
  return response.data;
};

// 9. Stream Chat (Special Handling using fetch API)
export const streamChatRequest = async (
  sessionId: string,
  userMessage: string,
  onChunk: (chunk: string) => void,
  onError: (err: any) => void
) => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `/api/v1/notes/chat/${sessionId}?user_prompt=${encodeURIComponent(
        userMessage
      )}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      onChunk(chunk);
    }
  } catch (err) {
    onError(err);
  }
};
