import { useState } from "react";

interface ProvenancePinProps {
  modality: "image" | "audio" | "text";
  source?: string;
  tooltip?: string;
}

export function ProvenancePin({ modality, source, tooltip }: ProvenancePinProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getIcon = () => {
    switch (modality) {
      case "image":
        return "◐";
      case "audio":
        return "♪";
      case "text":
        return "¶";
      default:
        return "•";
    }
  };

  const getColor = () => {
    switch (modality) {
      case "image":
        return "text-pink-600"; // #ec4899
      case "audio":
        return "text-purple-600"; // #8b5cf6
      case "text":
        return "text-cyan-600"; // #06b7d4
      default:
        return "text-gray-600";
    }
  };

  const getLabel = () => {
    switch (modality) {
      case "image":
        return "ID Photo";
      case "audio":
        return "Audio Testimony";
      case "text":
        return "Caseworker Notes";
      default:
        return "Source";
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className={`inline-block text-xl cursor-pointer hover:opacity-80 transition ${getColor()}`}
        title={tooltip || getLabel()}
      >
        {getIcon()}
      </button>

      {showTooltip && (
        <div className="absolute left-0 bottom-full mb-2 bg-gray-900 text-white px-3 py-2 rounded text-xs whitespace-nowrap z-10">
          <p className="font-medium">{getLabel()}</p>
          {source && <p className="text-gray-300 mt-1">{source}</p>}
          {tooltip && <p className="text-gray-400 text-xs mt-1">{tooltip}</p>}
          <div className="absolute top-full left-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
}
