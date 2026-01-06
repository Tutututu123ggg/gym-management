"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
// Import Container Component to
import TrainerHome from "@/components/trainer/TrainerHome"; 

export default function DashboardPage() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  // Guard cơ bản
  useEffect(() => {
    if (!isLoading && !isLoggedIn) router.push("/login");
  }, [isLoading, isLoggedIn, router]);

  if (isLoading) return null;

  return <TrainerHome />;
}