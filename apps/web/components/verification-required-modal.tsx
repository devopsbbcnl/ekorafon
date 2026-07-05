"use client";

import Link from "next/link";

const G      = "#008751";
const TEXT   = "#333333";
const MUTED  = "#666666";
const BORDER = "#E8E8E8";

export default function VerificationRequiredModal({
  action, onClose, onGoToVerification,
}: {
  action: string;
  onClose: () => void;
  onGoToVerification?: () => void;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="rounded-xl w-full max-w-sm overflow-hidden" style={{ backgroundColor: "white" }}>
        <div className="px-6 py-6 text-center">
          <div style={{ fontSize: "32px", marginBottom: "10px" }}>🔒</div>
          <p className="font-black text-base mb-2" style={{ color: TEXT }}>Verification required</p>
          <p className="text-sm mb-5" style={{ color: MUTED }}>
            Your factory profile needs to be verified before you can {action}. Submit a verification request from your dashboard to get started.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg font-bold text-sm border"
              style={{ borderColor: BORDER, color: MUTED, backgroundColor: "white", cursor: "pointer" }}
            >
              Close
            </button>
            {onGoToVerification ? (
              <button
                onClick={onGoToVerification}
                className="flex-1 py-2.5 rounded-lg font-bold text-sm"
                style={{ backgroundColor: G, color: "white", border: "none", cursor: "pointer" }}
              >
                Get Verified
              </button>
            ) : (
              <Link
                href="/dashboard/supplier"
                className="flex-1 py-2.5 rounded-lg font-bold text-sm text-center"
                style={{ backgroundColor: G, color: "white", textDecoration: "none" }}
              >
                Get Verified
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
