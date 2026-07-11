"use client";

import MediaLibrary from "./MediaLibrary";

/** Modal that lets an admin pick (or upload) an image and returns its URL. */
export default function MediaPickerModal({
  open,
  onClose,
  onPick,
  folder = "media",
  notify,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (url: string) => void;
  folder?: string;
  notify?: (t: { msg: string; type: "success" | "error" }) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-secondary">Choose an image</h3>
          <button onClick={onClose} className="text-2xl leading-none text-slate-400">×</button>
        </div>
        <MediaLibrary
          folder={folder}
          notify={notify}
          onPick={(url) => { onPick(url); onClose(); }}
        />
      </div>
    </div>
  );
}
