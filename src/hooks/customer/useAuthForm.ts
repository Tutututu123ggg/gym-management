import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { loginUserAction, registerUserAction } from '@/actions/admin/auth';

export function useAuthForm(onClose: () => void) {
  const router = useRouter();
  const { login } = useAuth();

  // State
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Helper change input
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(""); // Xóa lỗi khi user nhập lại
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError("");
    setFormData({ name: '', email: '', password: '' });
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const payload = new FormData();
    payload.append("email", formData.email);
    payload.append("password", formData.password);
    if (isRegistering) payload.append("name", formData.name);

    try {
      if (isRegistering) {
        // --- REGISTER ---
        const res = await registerUserAction(payload);
        if (res.success) {
          alert(res.message);
          setIsRegistering(false); // Chuyển về tab đăng nhập
          setFormData(prev => ({ ...prev, password: '' }));
        } else {
          setError(res.message || "Đăng ký thất bại");
        }
      } else {
        // --- LOGIN ---
        const res = await loginUserAction(payload);
        if (res.success && res.user) {
          login(res.user); // Lưu vào Context
          onClose();       // Đóng Modal

          // Điều hướng dựa trên Role
          if (res.user.role === 'ADMIN') {
            router.push('/admin/dashboard'); 
          } else {
            router.push('/progress');
          }
        } else {
          setError(res.message || "Đăng nhập thất bại");
        }
      }
    } catch (err) {
      setError("Lỗi kết nối Server.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isRegistering,
    formData,
    error,
    isLoading,
    toggleMode,
    handleChange,
    handleSubmit
  };
}