import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserProfileAction, updateUserProfileAction } from '@/actions/customer/user-profile';
import { UserProfileData } from '@/types/customer/user-profile';

export function useUserProfile() {
  const { user: authUser, login, isLoggedIn } = useAuth();
  
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Fetch Profile
  const fetchProfile = useCallback(async () => {
    if (!authUser?.email) return;
    const res = await getUserProfileAction(authUser.email);
    if (res.success && res.user) {
        setProfile(res.user);
    }
    setLoading(false);
  }, [authUser?.email]);

  useEffect(() => {
    if (isLoggedIn) fetchProfile();
  }, [isLoggedIn, fetchProfile]);

  // Update Profile
  const updateProfile = async (formData: FormData) => {
    setSaving(true);
    setMessage(null);
    const res = await updateUserProfileAction(formData);
    
    if (res.success && res.user) {
      setMessage({ type: 'success', text: res.message || "Cập nhật thành công" });
      setProfile(res.user);
      login(res.user); // Cập nhật Context để Header/Sidebar nhận diện thay đổi ngay lập tức
    } else {
      setMessage({ type: 'error', text: res.message || "Lỗi cập nhật" });
    }
    setSaving(false);
  };

  return {
    profile,
    loading,
    saving,
    message,
    isLoggedIn,
    actions: { updateProfile }
  };
}