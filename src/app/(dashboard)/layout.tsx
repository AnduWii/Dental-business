import Link from "next/link";
import { redirect } from "next/navigation";
import { getDashboardContext } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId, clinic, isAdmin } = await getDashboardContext();
  if (!userId) redirect("/login");
  if (!clinic) redirect(isAdmin ? "/admin" : "/onboarding");

  const needsBilling =
    clinic.subscription_status === "paused" || clinic.subscription_status === "canceled";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar clinicName={clinic.name} isAdmin={isAdmin} />
      <main className="flex flex-1 flex-col overflow-hidden">
        {needsBilling ? (
          <Link
            href="/billing"
            className="block border-b border-amber-200 bg-amber-50 px-8 py-2.5 text-center text-sm font-medium text-amber-900 transition-colors duration-150 hover:bg-amber-100"
          >
            {clinic.subscription_status === "paused"
              ? "Your last payment didn't go through. Update billing to keep Catchline running."
              : "Your subscription is canceled. Restart it to keep recovering missed calls."}
          </Link>
        ) : null}
        <div className="flex-1 overflow-hidden">{children}</div>
      </main>
    </div>
  );
}
