"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND } from "@/lib/constants";

const NAV = [
  { href: "/dashboard", label: "Inbox", Icon: InboxIcon },
  { href: "/missed-calls", label: "Missed calls", Icon: PhoneIcon },
  { href: "/notifications", label: "Notifications", Icon: BellIcon },
  { href: "/billing", label: "Billing", Icon: CardIcon },
  { href: "/settings", label: "Settings", Icon: GearIcon },
];

export function Sidebar({ clinicName, isAdmin = false }: { clinicName: string; isAdmin?: boolean }) {
  const pathname = usePathname();
  const nav = isAdmin ? [...NAV, { href: "/admin", label: "Admin", Icon: ShieldIcon }] : NAV;

  return (
    <aside className="flex w-[248px] shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 px-[18px] pb-3.5 pt-[18px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.png" alt="" className="h-[34px] w-auto" />
        <div className="min-w-0 leading-tight">
          <div className="text-base font-bold text-brand-900">{BRAND.name}</div>
          <div className="truncate text-xs text-slate-400">{clinicName}</div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-[3px] px-3 py-1.5">
        {nav.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-[9px] px-3 py-2 text-sm font-medium ${
                active ? "bg-brand-50 font-semibold text-brand-700" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Icon className={active ? "text-brand-600" : "text-slate-400"} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <form action="/auth/signout" method="post" className="border-t border-slate-100 p-3">
        <button
          type="submit"
          className="flex w-full items-center gap-2.5 rounded-[9px] px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-50"
        >
          <LogoutIcon className="text-slate-400" />
          <span>Sign out</span>
        </button>
      </form>
    </aside>
  );
}

function Svg({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

function InboxIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M3 12h4l2 3h6l2-3h4" />
      <path d="M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
    </Svg>
  );
}
function PhoneIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M14.5 4.5 19 9M19 4.5 14.5 9" />
      <path d="M3 5.5a2 2 0 0 1 2-2h2.3a1 1 0 0 1 1 .76l.9 3.6a1 1 0 0 1-.5 1.1L8 10a14 14 0 0 0 6 6l1-1.1a1 1 0 0 1 1.1-.3l3.6.9a1 1 0 0 1 .76 1V20a2 2 0 0 1-2 2A17 17 0 0 1 3 5.5z" />
    </Svg>
  );
}
function BellIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </Svg>
  );
}
function CardIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
    </Svg>
  );
}
function GearIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Svg>
  );
}
function ShieldIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  );
}
function LogoutIcon({ className }: { className?: string }) {
  return (
    <Svg className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </Svg>
  );
}
