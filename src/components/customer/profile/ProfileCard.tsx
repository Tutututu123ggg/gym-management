"use client";
import React from 'react';
import { UserProfileData } from '@/types/customer/user-profile';

export default function ProfileCard({ user }: { user: UserProfileData }) {
  const formattedDob = user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : '--/--/----';
  const formattedJoinDate = new Date(user.createdAt).toLocaleDateString('vi-VN');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 text-center sticky top-24">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-blue-500/30 shadow-lg">
            {user.name?.charAt(0).toUpperCase()}
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
        <div className="mt-2">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300 rounded-full">
                {user.role}
            </span>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 text-sm space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Giới tính:</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{user.gender || 'Chưa cập nhật'}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Ngày sinh:</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{formattedDob}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400">Tham gia:</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">{formattedJoinDate}</span>
            </div>
        </div>
    </div>
  );
}