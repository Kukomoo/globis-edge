import { useState } from "react";

interface TestDataBadgeProps {
  isSyntheticData: boolean;
  sessionId?: string;
}

export function TestDataBadge({
  isSyntheticData,
  sessionId,
}: TestDataBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!isSyntheticData) {
    return null;
  }

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 border border-orange-300 rounded-full text-sm font-medium text-orange-900 cursor-help hover:bg-orange-200 transition"
      >
        <span>🧪</span>
        <span>Synthetic Test Data</span>
      </div>

      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 bg-[#1a2028] text-white px-3 py-2 rounded-xl text-xs whitespace-nowrap z-50 max-w-xs">
          <p className="font-medium mb-1">This is synthetic test data</p>
          <p className="text-[#93B1C2]">
            For development and demo purposes only. This is NOT a real refugee
            case. All identities, artifacts, and case details are fabricated for
            testing.
          </p>
          {sessionId && (
            <p className="text-[#9bafba] mt-2 text-xs">
              Session: {sessionId}
            </p>
          )}
          <div className="absolute bottom-full right-3 w-2 h-2 bg-[#1a2028] transform rotate-45"></div>
        </div>
      )}
  </div>
  );
}
