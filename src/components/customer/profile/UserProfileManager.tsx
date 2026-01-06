"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/customer/useUserProfile';

import ProfileCard from './ProfileCard';
import ProfileEditForm from './ProfileEditForm';

export default function UserProfileManager() {
  const { profile, loading, saving, message, isLoggedIn, actions } = useUserProfile();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) router.push('/');
  }, [isLoggedIn, router]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!isLoggedIn || !profile) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-fade-in-up">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Hồ Sơ Của Tôi</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cột trái */}
        <div className="col-span-1">
            <ProfileCard user={profile} />
        </div>

        {/* Cột phải */}
        <div className="col-span-1 md:col-span-2">
            <ProfileEditForm 
                user={profile} 
                isSaving={saving} 
                message={message} 
                onUpdate={actions.updateProfile} 
            />
        </div>
      </div>
    </div>
  );
}