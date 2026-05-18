export function ConflictChip({ conflict }: { conflict: any }) {
  const getIcon = (field: string) => {
    if (field.includes("year")) return "📅";
    if (field.includes("name")) return "👤";
    if (field.includes("origin")) return "🌍";
    return "⚠️";
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-amber-200 rounded-xl">
      <span className="text-lg">{getIcon(conflict.field)}</span>
      <div className="flex-1">
        <p className="font-medium text-sm text-[#1a2028]">{conflict.field}</p>
        <p className="text-xs text-[#6b7f8c]">
          {conflict.value_a} vs {conflict.value_b}
        </p>
      </div>
      <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-lg font-medium">
        Cross-modal mismatch
      </span>
    </div>
  );
}
