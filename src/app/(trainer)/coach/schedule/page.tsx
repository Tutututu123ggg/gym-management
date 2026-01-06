"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
// Import Container Component to
import TrainerScheduleManager from "@/components/trainer/TrainerScheduleManager";

export default function SchedulePage() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) router.push("/login");
  }, [isLoading, isLoggedIn, router]);

  if (isLoading) return null;

  return <TrainerScheduleManager />;
}