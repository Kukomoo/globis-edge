import { useState } from "react";

interface OverrideButtonProps {
  blockedFieldCount: number;
  onConfirm: (signature: string) => void;
  disabled?: boolean;
}

export function OverrideButton({
  blockedFieldCount,
  onConfirm,
  disabled = false,
}: OverrideButtonProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [signature, setSignature] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleConfirm = () => {
    if (signature.trim() && agreed) {
      onConfirm(signature);
      // Reset state after confirmation
      setSignature("");
      setAgreed(false);
      setShowConfirmation(false);
    }
  };

  return (
    <div>
      {!showConfirmation ? (
        <button
          onClick={() => setShowConfirmation(true)}
          disabled={disabled || blockedFieldCount === 0}
          className="px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-400 transition"
        >
          Commit with Awareness
        </button>
      ) : (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Header */}
            <div className="bg-red-50 border-b border-red-200 p-6">
              <p className="text-lg font-bold text-red-900">
                ⚠️ Commit Record with Protected Fields?
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm text-yellow-900 font-medium mb-1">
                  This record contains {blockedFieldCount} protected field(s):
                </p>
                <p className="text-sm text-yellow-800">
                  By committing, you are acknowledging that you are aware of
                  what was blocked and understand the protection implications.
                </p>
              </div>

              {/* Legal Grounding */}
              <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded p-3">
                <p className="font-medium mb-1">
                  🛡️ Legal Foundation (Article 31, 1951 Refugee Convention):
                </p>
                <p>
                  Protected fields are withheld to minimize sensitive data
                  collection and comply with international protection principles.
                  Your decision will be logged.
                </p>
              </div>

              {/* Signature Field */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Caseworker Name/ID (Required):
                </label>
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Your name or caseworker ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be logged in the audit trail
                </p>
              </div>

              {/* Acknowledgment */}
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-gray-700">
                  I acknowledge that{" "}
                  <strong>{blockedFieldCount} field(s) were blocked</strong> for
                  protection reasons, and I am proceeding with full awareness of
                  this decision.
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 p-6 bg-gray-50 flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setSignature("");
                  setAgreed(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!signature.trim() || !agreed}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:bg-gray-400 transition"
              >
                Commit & Log Decision
              </button>
            </div>

            {/* Footer Info */}
            <div className="border-t border-gray-200 p-4 bg-white text-xs text-gray-500">
              <p>
                ℹ️ This decision will be logged with: timestamp, your name/ID,
                session ID, and which fields were blocked.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
