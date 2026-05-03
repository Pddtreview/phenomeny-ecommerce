'use client'

import { useState } from "react";

const PRIMARY = "#1B3A6B";

export function AdminOrderNotes({
  orderId,
  initialNote,
}: {
  orderId: string;
  initialNote: string;
}) {
  const [note, setNote] = useState(initialNote);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSavedMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/note`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to save note");
      }
      setSavedMessage("Saved");
      setTimeout(() => setSavedMessage(null), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <textarea
        placeholder="Add internal notes..."
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2"
        style={{ outlineColor: PRIMARY }}
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg px-4 py-1.5 text-xs font-medium text-white disabled:opacity-70"
          style={{ backgroundColor: PRIMARY }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {savedMessage && (
          <span className="text-xs text-emerald-600">{savedMessage}</span>
        )}
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    </div>
  );
}

