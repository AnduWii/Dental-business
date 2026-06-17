import { redirect } from "next/navigation";
import { getDashboardContext } from "@/lib/auth";
import { createClinic } from "@/app/(dashboard)/actions";
import { BRAND } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { userId, clinic } = await getDashboardContext();
  if (!userId) redirect("/login");
  if (clinic) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-brand-600">{BRAND.name}</h1>
        <p className="mt-1 text-slate-600">Let&apos;s set up your clinic. Takes about a minute.</p>

        <form action={createClinic} className="mt-8 space-y-4">
          <Field label="Clinic name" name="name" placeholder="Bright Smile Dental" required />
          <Field label="Your name" name="full_name" placeholder="Dr. Jane Doe" />
          <Field
            label="Front-desk mobile (for alerts)"
            name="notify_phone"
            placeholder="+16475551234"
            hint="We text this number the moment a lead comes in. Use E.164 format."
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
            className="w-full rounded-lg bg-brand-600 px-4 py-3 font-medium text-white hover:bg-brand-700"
          >
            Create my dashboard
          </button>
          <p className="text-center text-xs text-slate-500">
            You&apos;ll connect your phone number on the next screen.
          </p>
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
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
