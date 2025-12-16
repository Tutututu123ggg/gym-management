/**
 * -----------------------------------------------------------------------------
 * FILE: src/app/verify-email/page.tsx
 * * MÔ TẢ:
 * Đây là trang đích (Landing Page) khi người dùng bấm vào link trong email.
 * Trang này có nhiệm vụ:
 * 1. Lấy mã "token" từ trên thanh địa chỉ URL.
 * 2. Gọi Server Action "verifyEmailToken" để kiểm tra token đó.
 * 3. Hiển thị thông báo Thành công hoặc Thất bại.
 * * LIÊN HỆ VỚI CÁC FILE KHÁC:
 * - Gọi Backend: src/actions/auth.ts (Hàm verifyEmailToken).
 * -----------------------------------------------------------------------------
 */

"use client";

import { verifyEmailToken } from "@/actions/auth";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

// Component con để xử lý logic lấy params (để tránh lỗi Suspense trong Next.js mới)
function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Đang xác thực tài khoản của bạn...");

  useEffect(() => {
    if (!token) {
      console.log("Link không hợp lệ (Thiếu mã xác thực).");
      return;
    }

    // Gọi Server Action
    verifyEmailToken(token)
      .then((res) => {
        if (res.success) {
          setStatus("success");
          setMessage(res.message);
        } else {
          setStatus("error");
          setMessage(res.message);
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Có lỗi xảy ra khi kết nối đến Server.");
      });
  }, [token]);

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl text-center border border-gray-100 dark:border-gray-800">
      {/* 1. TRẠNG THÁI LOADING */}
      {status === "loading" && (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Đang xử lý...</h2>
          <p className="text-gray-500 dark:text-gray-400">{message}</p>
        </div>
      )}

      {/* 2. TRẠNG THÁI THÀNH CÔNG */}
      {status === "success" && (
        <div className="animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
            ✅
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Xác Thực Thành Công!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
          
          <Link 
            href="/" 
            className="inline-block w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all transform hover:scale-105 shadow-lg shadow-blue-500/30"
          >
            Về Trang Chủ & Đăng Nhập
          </Link>
        </div>
      )}

      {/* 3. TRẠNG THÁI LỖI */}
      {status === "error" && (
        <div className="animate-in zoom-in duration-300">
           <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
            ❌
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Xác Thực Thất Bại</h2>
          <p className="text-red-500 mb-6">{message}</p>
          
          <Link 
            href="/" 
            className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 underline"
          >
            Quay về trang chủ
          </Link>
        </div>
      )}
    </div>
  );
}

// Component chính (Bắt buộc phải bọc Suspense khi dùng useSearchParams)
export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black px-4">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}