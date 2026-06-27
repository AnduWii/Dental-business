import { getDashboardContext } from "@/lib/auth";
import { updateSettings } from "@/app/(dashboard)/actions";
import { ClinicSettingsForm } from "@/components/ClinicSettingsForm";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { clinic } = await getDashboardContext();
  if (!clinic) return null;

  return (
    <div className="scroll-area h-full overflow-y-auto bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-8 py-5">
        <h1 className="text-xl font-semibold text-brand-900">Settings</h1>
      </header>
      <div className="mx-auto max-w-2xl px-8 py-8">
        <ClinicSettingsForm clinic={clinic} action={updateSettings} appUrl={env.appUrl()} />
      </div>
    </div>
  );
}
