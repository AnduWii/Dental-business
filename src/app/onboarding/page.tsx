import { redirect } from "next/navigation";
import { getDashboardContext } from "@/lib/auth";
import { createClinic } from "@/app/(dashboard)/actions";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { userId, clinic } = await getDashboardContext();
  if (!userId) redirect("/login");
  if (clinic) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-12">
      <div className="w-full max-w-[460px]">
        <div className="flex items-center gap-2.5">
          <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-brand-600 text-[15px] font-bold text-white">
            C
          </span>
          <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-slate-400">
            Step 1 of 2 · Set up clinic
          </span>
        </div>
        <h1 className="mt-[18px] text-[27px] font-bold tracking-tight text-brand-900">
          Let&apos;s set up your clinic
        </h1>
        <p className="mt-1.5 text-[15px] text-slate-500">
          Takes about a minute. You&apos;ll connect your phone number next.
        </p>

        <form
          action={createClinic}
          className="mt-[26px] flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_6px_24px_rgba(31,45,61,0.06)]"
        >
          <Field label="Clinic name" name="name" placeholder="Bright Smile Dental" required />
          <Field label="Your name" name="full_name" placeholder="Dr. Jane Doe" />
          <Field
            label="Front-desk mobile"
            name="notify_phone"
            placeholder="+1 (647) 555-1234"
            hint="We text this number the moment a lead comes in."
            note="(for alerts)"
          />
          <Field
            label="Notification email"
            name="notify_email"
            type="email"
            placeholder="frontdesk@clinic.com"
          />
          <input type="hidden" name="timezone" value="America/Toronto" />
          <button
            type="submit"
            className="mt-1 w-full rounded-[9px] bg-brand-600 px-4 py-3 font-semibold text-white hover:bg-brand-700"
          >
            Create my dashboard
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
  required,
  hint,
  note,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hint?: string;
  note?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
        {label} {note && <span className="font-normal text-slate-400">{note}</span>}
      </label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-[9px] border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
      />
      {hint && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
