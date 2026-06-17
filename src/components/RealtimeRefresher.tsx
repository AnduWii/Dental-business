"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Subscribes to Postgres changes for a clinic and refreshes the server
// components when something lands — so the inbox/feeds update live without
// us hand-rolling client state. Simple and reliable.
export function RealtimeRefresher({
  table,
  clinicId,
}: {
  table: "conversations" | "messages" | "notifications";
  clinicId: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`rt:${table}:${clinicId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: `clinic_id=eq.${clinicId}` },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, clinicId, router]);

  return null;
}
