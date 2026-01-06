"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import MemberManager from "@/components/trainer/MemberManager";

export default function TrainerMembersPage() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  // Route Guard
  useEffect(() => {
    if (!isLoading && !isLoggedIn) router.push("/login");
  }, [isLoading, isLoggedIn, router]);

  if (isLoading) return null;

  return <MemberManager />;
}