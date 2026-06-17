import { redirect } from "next/navigation";
import { getDashboardContext } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId, clinic } = await getDashboardContext();
  if (!userId) redirect("/login");
  if (!clinic) redirect("/onboarding");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar clinicName={clinic.name} />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
