import { useState, useRef, useEffect } from "react";
import { useSession } from "../../store/SessionContext";
import { uploadArtifact } from "../../services/api";

// ── Types ──────────────────────────────────────────────────────────────────────
type Tab = "photo" | "audio" | "text";

// ── Camera capture component ───────────────────────────────────────────────────
function CameraCapture({ onCapture }: { onCapture: (file: File) => void }) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const [active, setActive]     = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [captured, setCaptured] = useState<string | null>(null); // data URL preview

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setActive(true);
    } catch (err: any) {
      setError(err.name === "NotAllowedError"
        ? "Camera access denied. Allow camera in browser settings and retry."
        : "Could not access camera: " + err.message);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActive(false);
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCaptured(dataUrl);
    stopCamera();

    // Convert to File and hand up
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file);
      }
    }, "image/jpeg", 0.92);
  };

  // Cleanup on unmount
  useEffect(() => () => { streamRef.current?.getTracks().forEach((t) => t.stop()); }, []);

  if (captured) {
    return (
      <div className="space-y-3">
        <div className="relative rounded-xl overflow-hidden border border-slate-200">
          <img src={captured} alt="Captured" className="w-full object-cover max-h-64" />
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            ✓ Captured
          </div>
        </div>
        <button
          type="button"
          onClick={() => { setCaptured(null); startCamera(); }}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          Retake photo
        </button>
      </div>
    );
  }

  if (active) {
    return (
      <div className="space-y-3">
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black">
          <video ref={videoRef} playsInline muted className="w-full max-h-72 object-cover" />
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-500/90 text-white text-xs font-bold px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={capture}
            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            📸 Capture
          </button>
          <button
            type="button"
            onClick={stopCamera}
            className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {/* Live camera */}
        <button
          type="button"
          onClick={startCamera}
          className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-200
                     rounded-xl hover:border-blue-400 hover:bg-blue-50/30 transition-colors group"
        >
          <span className="text-3xl">📷</span>
          <span className="text-sm font-medium text-slate-600 group-hover:text-blue-700">Use Camera</span>
          <span className="text-xs text-slate-500">Live capture from device</span>
        </button>
        {/* File upload fallback */}
        <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-200
                          rounded-xl hover:border-blue-400 hover:bg-blue-50/30 transition-colors group cursor-pointer">
          <span className="text-3xl">🖼️</span>
          <span className="text-sm font-medium text-slate-600 group-hover:text-blue-700">Upload File</span>
          <span className="text-xs text-slate-500">JPG, PNG, HEIC — 10MB</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onCapture(f); }}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}

// ── Audio recorder component ───────────────────────────────────────────────────
function AudioRecorder({ onRecord }: { onRecord: (file: File) => void }) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<BlobPart[]>([]);
  const [recording, setRecording] = useState(false);
  const [duration, setDuration]   = useState(0);
  const [recorded, setRecorded]   = useState<string | null>(null); // blob URL
  const [error, setError]         = useState<string | null>(null);
  const timerRef                  = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url  = URL.createObjectURL(blob);
        setRecorded(url);
        const file = new File([blob], `recording_${Date.now()}.webm`, { type: "audio/webm" });
        onRecord(file);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch (err: any) {
      setError(err.name === "NotAllowedError"
        ? "Microphone access denied. Allow microphone in browser settings."
        : "Could not access microphone: " + err.message);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatDuration = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stream?.getTracks().forEach((t) => t.stop());
  }, []);

  if (recorded) {
    return (
      <div className="space-y-3">
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
              <svg width="12" height="14" viewBox="0 0 12 14" fill="white">
                <path d="M6 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3zm5 8a5 5 0 0 1-10 0H0a6 6 0 0 0 5 5.92V16h2v-2.08A6 6 0 0 0 12 8h-1z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-purple-900">Recording captured</p>
              <p className="text-xs text-purple-600">{formatDuration(duration)} · WebM audio</p>
            </div>
            <span className="ml-auto text-green-500 font-bold">✓</span>
          </div>
          <audio controls src={recorded} className="w-full h-8" />
        </div>
        <button
          type="button"
          onClick={() => { setRecorded(null); setDuration(0); }}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          Record again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">{error}</div>
      )}
      {recording ? (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="w-16 h-16 rounded-full bg-red-100 border-4 border-red-400 flex items-center justify-center animate-pulse">
            <svg width="20" height="24" viewBox="0 0 20 24" fill="#ef4444">
              <rect x="7" y="0" width="6" height="14" rx="3"/>
              <path d="M3 10a7 7 0 0 0 14 0" stroke="#ef4444" strokeWidth="2" fill="none"/>
              <line x1="10" y1="17" x2="10" y2="22" stroke="#ef4444" strokeWidth="2"/>
              <line x1="6" y1="22" x2="14" y2="22" stroke="#ef4444" strokeWidth="2"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-red-700">Recording…</p>
            <p className="text-2xl font-mono font-bold text-red-600 mt-1">{formatDuration(duration)}</p>
          </div>
          <button
            type="button"
            onClick={stopRecording}
            className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            ⏹ Stop Recording
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {/* Live microphone */}
          <button
            type="button"
            onClick={startRecording}
            className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-200
                       rounded-xl hover:border-purple-400 hover:bg-purple-50/30 transition-colors group"
          >
            <span className="text-3xl">🎤</span>
            <span className="text-sm font-medium text-slate-600 group-hover:text-purple-700">Record Audio</span>
            <span className="text-xs text-slate-500">Uses device microphone</span>
          </button>
          {/* File upload fallback */}
          <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-200
                            rounded-xl hover:border-purple-400 hover:bg-purple-50/30 transition-colors group cursor-pointer">
            <span className="text-3xl">📁</span>
            <span className="text-sm font-medium text-slate-600 group-hover:text-purple-700">Upload File</span>
            <span className="text-xs text-slate-500">MP3, WAV, M4A — 50MB</span>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onRecord(f);
              }}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────────
export function Screen2_Ingest() {
  const { state, dispatch } = useSession();
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("photo");
  const [textNotes, setTextNotes] = useState("");
  const [textSaved, setTextSaved] = useState(false);

  const uploadFile = async (file: File, modality: string) => {
    if (!state.id) {
      // offline / demo stub: add artifact locally without backend
      dispatch({
        type: "ADD_ARTIFACT",
        payload: {
          modality,
          filename: file.name,
          label: modality === "image" ? "ID Document" : "Audio Testimony",
          icon: modality === "image" ? "📷" : "🎤",
          preview: `[${file.name} — ${(file.size / 1024).toFixed(0)} KB]`,
          ingested_at: new Date().toISOString(),
        },
      });
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("session_id", state.id);
      formData.append("modality", modality);
      formData.append("file", file);
      const response = await uploadArtifact(formData);
      dispatch({ type: "ADD_ARTIFACT", payload: { modality, filename: file.name, ...response.data } });
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveNotes = () => {
    if (!textNotes.trim()) return;
    dispatch({
      type: "ADD_ARTIFACT",
      payload: {
        modality: "text",
        filename: "caseworker_notes.txt",
        label: "Caseworker Notes",
        text: textNotes.trim(),
        icon: "📝",
        preview: textNotes.trim().slice(0, 120) + (textNotes.length > 120 ? "…" : ""),
        ingested_at: new Date().toISOString(),
      },
    });
    setTextSaved(true);
    setTextNotes("");
  };

  const canProceed = state.artifacts.length > 0;

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "photo", label: "ID Photo", icon: "📷" },
    { id: "audio", label: "Audio",    icon: "🎤" },
    { id: "text",  label: "Notes",    icon: "📝" },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div>

        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Ingest Artifacts</h1>
          <p className="text-sm text-slate-500">
            Capture documents, audio testimony, and notes for{" "}
            <strong className="text-slate-700">{state.site || "this session"}</strong>
          </p>
        </div>

        {/* Demo pre-load banner */}
        {state.demo_loaded && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <span className="text-amber-500 text-lg flex-shrink-0">⚡</span>
              <div>
                <p className="font-semibold text-amber-900 text-sm mb-0.5">Demo Pre-loaded — Hawa Adam / Adré</p>
                <p className="text-xs text-amber-700">
                  Passport (OCR) · Arabic audio (Scout E2B — 820ms) · Caseworker notes. All synthetic.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Artifact cards (demo mode) */}
        {state.demo_loaded && state.artifacts.length > 0 && (
          <div className="space-y-3 mb-7">
            {state.artifacts.map((artifact: any, idx: number) => (
              <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={`
                    w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0
                    ${artifact.modality === "image" ? "bg-blue-50"
                    : artifact.modality === "audio" ? "bg-purple-50" : "bg-green-50"}
                  `}>
                    {artifact.icon || "📄"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-semibold text-slate-900 text-sm">{artifact.label}</p>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        ✓ Loaded
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mb-2 truncate">{artifact.filename}</p>
                    {artifact.preview && (
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">
                          {artifact.modality === "image" ? "OCR Extract"
                           : artifact.modality === "audio" ? "Transcript · Scout E2B"
                           : "Caseworker Notes"}
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed italic">
                          "{artifact.preview}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Manual capture/upload UI */}
        {!state.demo_loaded && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">

            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 flex items-center justify-center gap-1.5 px-3 py-3.5 text-sm font-medium
                    transition-colors border-b-2
                    ${activeTab === tab.id
                      ? "border-blue-600 text-blue-700 bg-blue-50/40"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }
                  `}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === "photo" && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 mb-4">
                    Use the connected device camera or upload a file. The Pi hotspot makes your phone/tablet camera available.
                  </p>
                  <CameraCapture onCapture={(file) => uploadFile(file, "image")} />
                </div>
              )}

              {activeTab === "audio" && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 mb-4">
                    Record directly from device microphone or upload an existing audio file. Used for transcription via Whisper-small.
                  </p>
                  <AudioRecorder onRecord={(file) => uploadFile(file, "audio")} />
                </div>
              )}

              {activeTab === "text" && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-500">
                    Enter intake observations, context, and any verbal information.
                  </p>
                  <textarea
                    value={textNotes}
                    onChange={(e) => { setTextNotes(e.target.value); setTextSaved(false); }}
                    placeholder="e.g. Arrived via informal group. Mother alert and responsive. Said they left Al-Geneina three weeks ago..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800
                               placeholder-slate-400 resize-none focus:outline-none focus:ring-2
                               focus:ring-blue-500 focus:border-transparent"
                    rows={6}
                  />
                  {textSaved && (
                    <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l2.5 2.5L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Notes saved as artifact
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={!textNotes.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium
                               hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-colors"
                  >
                    Save as Artifact
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              {uploading && (
                <div className="mt-4 flex items-center gap-2 text-sm text-blue-700">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                  Uploading to session…
                </div>
              )}
            </div>
          </div>
        )}

        {/* Artifact list (non-demo, after upload) */}
        {!state.demo_loaded && state.artifacts.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Ingested ({state.artifacts.length})
            </p>
            <div className="space-y-2">
              {state.artifacts.map((artifact: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 py-2 px-3 bg-slate-50 rounded-lg">
                  <span className="text-lg flex-shrink-0">
                    {artifact.modality === "image" ? "📷" : artifact.modality === "audio" ? "🎤" : "📝"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 truncate">{artifact.filename}</p>
                    <p className="text-xs text-slate-500 capitalize">{artifact.modality}</p>
                  </div>
                  <span className="text-xs text-green-600 font-medium flex-shrink-0">✓</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => dispatch({ type: "SET_SCREEN", payload: 1 })}
            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-medium text-sm
                       text-slate-600 hover:bg-slate-100 transition-colors"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "SET_SCREEN", payload: 3 })}
            disabled={uploading || !canProceed}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm
                       hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400
                       transition-colors shadow-sm"
          >
            {uploading ? "Uploading…" : "Continue to Synthesis →"}
          </button>
        </div>

      </div>
    </div>
  );
}
