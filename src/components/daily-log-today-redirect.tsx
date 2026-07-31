"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { todayKey } from "@/lib/dates";

export function DailyLogTodayRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/log/${todayKey()}`);
  }, [router]);

  return null;
}
