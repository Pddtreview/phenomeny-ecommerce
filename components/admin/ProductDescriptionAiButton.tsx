"use client";

import { useState } from "react";

const PRIMARY = "#1B3A6B";

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className ?? ""}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

type Props = {
  name: string;
  /** Human-readable category, e.g. "Frames" */
  categoryLabel: string;
  hsnCode: string;
  setDescription: (value: string) => void;
};

export function ProductDescriptionAiButton({
  name,
  categoryLabel,
  hsnCode,
  setDescription,
}: Props) {
  const [generating, setGenerating] = useState(false);
  const [btnError, setBtnError] = useState<string | null>(null);

  const onGenerate = async () => {
    if (!name.trim()) {
      setBtnError("Enter a product name first.");
      return;
    }
    setBtnError(null);
    setGenerating(true);
    setDescription("");
    try {
      const res = await fetch("/api/admin/products/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          category: categoryLabel.trim() || "general",
          hsn_code: hsnCode.trim(),
        }),
      });

      const ct = res.headers.get("content-type") ?? "";
      if (!res.ok) {
        if (ct.includes("application/json")) {
          const j = await res.json();
          throw new Error(j?.error || "Generation failed");
        }
        throw new Error(`Generation failed (${res.status})`);
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (value) {
          acc += dec.decode(value, { stream: true });
          setDescription(acc);
        }
        if (done) break;
      }
    } catch (e) {
      setBtnError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onGenerate}
        disabled={generating}
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {generating ? (
          <Spinner className="text-zinc-600" />
        ) : (
          <span
            className="flex h-3.5 w-3.5 items-center justify-center rounded text-[10px] font-bold text-white"
            style={{ backgroundColor: PRIMARY }}
          >
            AI
          </span>
        )}
        {generating ? "Generating…" : "AI Generate"}
      </button>
      {btnError && (
        <span className="max-w-[220px] text-right text-[11px] text-red-600">
          {btnError}
        </span>
      )}
    </div>
  );
}
