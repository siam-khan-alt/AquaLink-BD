/**
 * BulkActionToolbar Component
 * Allows doctors to select and perform bulk actions on consultations
 */

import React, { useCallback } from "react";
import { Check, X } from "lucide-react";
import Button from "@/components/ui/Button";

interface BulkActionToolbarProps {
  selectedCount: number;
  onBulkApprove: () => void;
  onBulkReject: () => void;
  onClearSelection: () => void;
  isProcessing: boolean;
}

export default function BulkActionToolbar({
  selectedCount,
  onBulkApprove,
  onBulkReject,
  onClearSelection,
  isProcessing,
}: BulkActionToolbarProps) {
  const handleBulkAction = useCallback(
    (action: "approve" | "reject") => {
      if (action === "approve") {
        onBulkApprove();
      } else {
        onBulkReject();
      }
    },
    [onBulkApprove, onBulkReject]
  );

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={true}
            readOnly
            className="w-5 h-5 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
          />
          <span className="text-sm font-bold text-[var(--text)] font-hind">
            {selectedCount} নির্বাচিত
          </span>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleBulkAction("approve")}
            disabled={isProcessing}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-hind font-bold flex items-center gap-2"
          >
            <Check size={16} />
            অনুমোদন করুন
          </Button>
          <Button
            onClick={() => handleBulkAction("reject")}
            disabled={isProcessing}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-hind font-bold flex items-center gap-2"
          >
            <X size={16} />
            বাতিল করুন
          </Button>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        <Button
          onClick={onClearSelection}
          disabled={isProcessing}
          variant="ghost"
          className="text-gray-600 hover:text-gray-800 font-hind"
        >
          নির্বাচন মুছুন
        </Button>
      </div>
    </div>
  );
}
