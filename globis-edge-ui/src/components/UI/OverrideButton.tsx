import { useState, useRef, useEffect } from "react";

interface OverrideButtonProps {
  blockedFieldCount: number;
  onConfirm: (signature: string) => void;
  disabled?: boolean;
}

export function OverrideButton({ blockedFieldCount, onConfirm, disabled = false }: OverrideButtonProps) {
  const [open, setOpen]         = useState(false);
  const [signature, setSignature] = useState("");
  const [agreed, setAgreed]     = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const canCommit = signature.trim().length > 0 && agreed;

  const handleConfirm = () => {
    if (!canCommit) return;
    onConfirm(signature.trim());
    setSignature(""); setAgreed(false); setOpen(false);
    triggerRef.current?.focus();
  };

  const handleCancel = () => {
    setSignature(""); setAgreed(false); setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (open) {
      signatureInputRef.current?.focus();
    }
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled || blockedFieldCount === 0}
        className="px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl
                   hover:bg-red-700 disabled:bg-[#dce8ee] disabled:text-[#9bafba]
                   transition-colors"
      >
        Commit with Awareness
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(2px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) handleCancel(); }}
          onKeyDown={(e) => { if (e.key === "Escape") handleCancel(); }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="override-dialog-title"
          >

            {/* Header */}
            <div className="px-6 py-5 border-b border-[rgba(147,177,194,0.25)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2L14 13H2L8 2Z" stroke="#dc2626" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M8 6v3.5M8 11v.5" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p id="override-dialog-title" className="font-bold text-[#1a2028] text-base">Commit with Protected Fields?</p>
                  <p className="text-xs text-[#6b7f8c] mt-0.5">This action will be permanently logged</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">

              {/* What's blocked */}
              <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-xl">
                <span className="text-red-500 flex-shrink-0 mt-0.5">🔒</span>
                <div>
                  <p className="text-sm font-semibold text-red-900">
                    {blockedFieldCount} protected field{blockedFieldCount > 1 ? "s" : ""} will not be exported
                  </p>
                  <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
                    By proceeding, you acknowledge awareness of what was blocked
                    and understand the protection implications.
                  </p>
                </div>
              </div>

              {/* Legal note */}
              <div className="flex items-start gap-3 p-3.5 bg-[#f7f9fa] border border-[rgba(147,177,194,0.35)] rounded-xl">
                <span className="text-[#6b7f8c] flex-shrink-0 mt-0.5 text-sm">⚖️</span>
                <p className="text-xs text-[#6b7f8c] leading-relaxed">
                  <strong className="text-[#3d4d58]">Article 31 · 1951 Refugee Convention:</strong>{" "}
                  Protected fields are withheld to minimise sensitive data collection
                  and comply with international protection principles.
                </p>
              </div>

              {/* Signature */}
              <div>
                <label className="block text-sm font-semibold text-[#3d4d58] mb-1.5">
                  Caseworker Name / ID
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  ref={signatureInputRef}
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Your name or caseworker ID"
                  className="w-full px-3.5 py-2.5 border border-[rgba(147,177,194,0.35)] rounded-xl text-sm
                             focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="text-xs text-[#6b7f8c] mt-1">Recorded in the audit trail with timestamp</p>
              </div>

              {/* Acknowledgement */}
              <label className={`
                flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors
                ${agreed ? "bg-green-50 border-green-200" : "bg-white border-[rgba(147,177,194,0.35)] hover:bg-[#f7f9fa]"}
              `}>
                <div className={`
                  w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors
                  ${agreed ? "bg-green-500 border-green-500" : "border-[rgba(147,177,194,0.5)]"}
                `}>
                  {agreed && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="sr-only" />
                <span className="text-sm text-[#3d4d58] leading-snug">
                  I acknowledge that{" "}
                  <strong className="text-[#1a2028]">{blockedFieldCount} field{blockedFieldCount > 1 ? "s" : ""} were blocked</strong>{" "}
                  for protection reasons, and I am proceeding with full awareness.
                </span>
              </label>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-[#f7f9fa] border-t border-[rgba(147,177,194,0.25)] flex gap-3">
              <button
                type="button"
                aria-label="Close"
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 border border-[rgba(147,177,194,0.35)] rounded-xl text-sm font-medium
                           text-[#6b7f8c] hover:bg-[#f0f5f8] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!canCommit}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold
                           hover:bg-red-700 disabled:bg-[#dce8ee] disabled:text-[#9bafba] transition-colors"
              >
                Commit & Log Decision
              </button>
            </div>

            <div className="px-6 pb-4 text-xs text-[#6b7f8c] text-center">
              Logged with: timestamp · name/ID · session ID · blocked fields
            </div>
          </div>
        </div>
      )}
    </>
  );
}
