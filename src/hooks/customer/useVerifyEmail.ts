import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { verifyEmailTokenAction } from '@/actions/admin/auth';

export function useVerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Đang xác thực tài khoản của bạn...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Link không hợp lệ (Thiếu mã xác thực).");
      return;
    }

    // Gọi Server Action
    verifyEmailTokenAction(token)
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

  return { status, message };
}