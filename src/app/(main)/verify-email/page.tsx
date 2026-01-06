"use client";

import React, { Suspense } from "react";
import VerifyEmailCard from "@/components/customer/auth/VerifyEmailCard";

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black px-4">
      {/* Bắt buộc phải có Suspense khi dùng useSearchParams trong Client Component */}
      <Suspense fallback={<div className="text-gray-500">Đang tải trang xác thực...</div>}>
        <VerifyEmailCard />
      </Suspense>
    </div>
  );
}