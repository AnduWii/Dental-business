"use client";

import { useState, useTransition } from "react";
import { deleteClinicAsAdmin } from "@/app/(dashboard)/actions";

// Three-dot row menu for the admin clinics table. One action for now: delete,
// behind a confirm that spells out what goes with the clinic.
export function ClinicRowMenu({
  clinicId,
  clinicName,
  hasNumber,
}: {
  clinicId: string;
  clinicName: string;
  hasNumber: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function onDelete() {
    const warning =
      `Delete "${clinicName}"?\n\n` +
      "This permanently removes its conversations, messages, patients, and call history. " +
      "Owner accounts are unlinked and can onboard again." +
      (hasNumber
        ? "\n\nWARNING: this clinic has the Catchline phone number configured. Deleting it disconnects the live line."
        : "");
    if (!window.confirm(warning)) return;
    setOpen(false);
    startTransition(async () => {
      await deleteClinicAsAdmin(clinicId);
    });
  }

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        aria-label={`Actions for ${clinicName}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-600"
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <circle cx="8" cy="3" r="1.4" />
          <circle cx="8" cy="8" r="1.4" />
          <circle cx="8" cy="13" r="1.4" />
        </svg>
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-1 w-44 rounded-md border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              disabled={pending}
              onClick={onDelete}
              className="w-full rounded px-3 py-2 text-left text-sm font-medium text-red-600 transition-colors duration-150 hover:bg-red-50 disabled:opacity-60"
            >
              {pending ? "Deleting..." : "Delete clinic"}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
