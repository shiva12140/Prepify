import React, { useEffect, useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { fetchNoteBlob } from "../api/notesService";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Loader2,
} from "lucide-react";

// Configure PDF Worker (Required for pdfjs-dist)
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface Props {
  noteId: number;
}

const SecurePdfViewer: React.FC<Props> = ({ noteId }) => {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Fetch and Load PDF Data
  useEffect(() => {
    let isMounted = true;
    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch securely using existing Axios setup (sends Auth header)
        const blob = await fetchNoteBlob(noteId);
        const arrayBuffer = await blob.arrayBuffer();

        // Load into PDF.js
        const loadedPdf = await pdfjsLib.getDocument({ data: arrayBuffer })
          .promise;

        if (isMounted) {
          setPdfDoc(loadedPdf);
          setPageNum(1);
          setLoading(false);
        }
      } catch (err) {
        console.error("PDF Load Error:", err);
        if (isMounted) setError("Failed to load PDF. Please try again.");
        setLoading(false);
      }
    };

    if (noteId) loadPdf();

    return () => {
      isMounted = false;
    };
  }, [noteId]);

  // 2. Render Page on Canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current!;
        const context = canvas.getContext("2d")!;

        // Handle High DPI screens
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height = Math.floor(viewport.height) + "px";

        const transform =
          outputScale !== 1
            ? [outputScale, 0, 0, outputScale, 0, 0]
            : undefined;

        await page.render({
          canvasContext: context,
          canvas: canvas, // <--- FIX APPLIED HERE
          viewport: viewport,
          transform: transform,
        }).promise;
      } catch (err) {
        console.error("Page Render Error:", err);
      }
    };

    renderPage();
  }, [pdfDoc, pageNum, scale]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#F7E396] mb-2" />
        <p>Securely loading document...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-400 p-4 text-center">{error}</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[#525f88] rounded-xl overflow-hidden relative">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-[#434E78] border-b border-white/10 text-white z-10 shadow-md">
        <div className="flex items-center gap-2">
          <button
            disabled={pageNum <= 1}
            onClick={() => setPageNum((p) => p - 1)}
            className="p-1 hover:bg-white/10 rounded disabled:opacity-30 transition"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-medium w-16 text-center">
            {pageNum} / {pdfDoc?.numPages}
          </span>
          <button
            disabled={!pdfDoc || pageNum >= pdfDoc.numPages}
            onClick={() => setPageNum((p) => p + 1)}
            className="p-1 hover:bg-white/10 rounded disabled:opacity-30 transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
            className="p-1 hover:bg-white/10 rounded transition"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-xs w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(3.0, s + 0.2))}
            className="p-1 hover:bg-white/10 rounded transition"
          >
            <ZoomIn size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable Canvas Area */}
      <div className="flex-1 overflow-auto flex justify-center p-4 bg-[#525f88] custom-scrollbar">
        <canvas ref={canvasRef} className="shadow-2xl" />
      </div>
    </div>
  );
};

export default SecurePdfViewer;
