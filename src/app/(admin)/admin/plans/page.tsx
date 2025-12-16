"use client";
import React, { useState } from 'react';
import { AlertTriangle, Edit, Trash2, Power, Users } from 'lucide-react';

// Giả lập dữ liệu gói tập
interface Plan {
  id: string;
  name: string;
  price: number;
  activeUsers: number; // Số người đang dùng gói này
  status: 'ACTIVE' | 'INACTIVE';
}

const mockPlans: Plan[] = [
  { id: '1', name: 'Vé Ngày', price: 50000, activeUsers: 120, status: 'ACTIVE' },
  { id: '2', name: 'Thẻ 1 Tháng', price: 500000, activeUsers: 45, status: 'ACTIVE' },
  { id: '3', name: 'Gói Mùa Hè (Cũ)', price: 1200000, activeUsers: 0, status: 'INACTIVE' }, // Có thể xóa
  { id: '4', name: 'Gói PT 1-1', price: 5000000, activeUsers: 2, status: 'ACTIVE' }, // Chỉ được Inactive
];

export default function PlansManagement() {
  const [plans, setPlans] = useState(mockPlans);

  // Xử lý chuyển trạng thái (Ngưng phát hành gói mới)
  const toggleStatus = (id: string) => {
    setPlans(plans.map(p => p.id === id ? { ...p, status: p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : p));
  };

  // Xử lý xóa (Chỉ khi activeUsers === 0)
  const handleDelete = (id: string, activeUsers: number) => {
    if (activeUsers > 0) {
      alert("Không thể xóa gói này vì vẫn còn hội viên đang sử dụng! Vui lòng chuyển sang trạng thái 'Ngưng hoạt động' và chờ hội viên hết hạn.");
      return;
    }
    if (confirm("Bạn có chắc chắn xóa vĩnh viễn gói tập này?")) {
      setPlans(plans.filter(p => p.id !== id));
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h1 className="text-2xl font-bold mb-6">Quản lý Dịch vụ & Gói tập</h1>
      
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-gray-500">
            <th className="py-3">Tên Gói</th>
            <th className="py-3">Giá (VNĐ)</th>
            <th className="py-3">Người dùng hiện tại</th>
            <th className="py-3">Trạng thái</th>
            <th className="py-3 text-right">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan) => (
            <tr key={plan.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-4 font-medium">{plan.name}</td>
              <td className="py-4 text-blue-600 font-bold">{plan.price.toLocaleString()}</td>
              <td className="py-4">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-400" />
                  <span className={plan.activeUsers > 0 ? "text-slate-900" : "text-gray-400"}>
                    {plan.activeUsers}
                  </span>
                </div>
              </td>
              <td className="py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  plan.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {plan.status === 'ACTIVE' ? 'Đang phát hành' : 'Ngưng hoạt động'}
                </span>
              </td>
              <td className="py-4 flex justify-end gap-2">
                {/* Nút Ngưng hoạt động / Kích hoạt */}
                <button 
                  onClick={() => toggleStatus(plan.id)}
                  className="p-2 text-orange-500 hover:bg-orange-50 rounded"
                  title={plan.status === 'ACTIVE' ? "Ngưng phát hành gói này" : "Phát hành lại"}
                >
                  <Power size={18} />
                </button>

                {/* Nút Sửa (Luôn hiện) */}
                <button className="p-2 text-blue-500 hover:bg-blue-50 rounded">
                  <Edit size={18} />
                </button>

                {/* Nút Xóa (Logic điều kiện) */}
                <button 
                  onClick={() => handleDelete(plan.id, plan.activeUsers)}
                  className={`p-2 rounded ${
                    plan.activeUsers > 0 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-red-500 hover:bg-red-50'
                  }`}
                  title={plan.activeUsers > 0 ? "Vẫn còn người dùng, không thể xóa" : "Xóa vĩnh viễn"}
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Ghi chú cho Admin */}
      <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
        <AlertTriangle className="text-yellow-600 shrink-0" />
        <div className="text-sm text-yellow-800">
          <strong>Lưu ý quan trọng:</strong> Bạn chỉ có thể XÓA một gói tập khi số người dùng hiện tại bằng 0. 
          Nếu muốn dừng gói, hãy chuyển trạng thái sang <strong>Ngưng hoạt động</strong>. Các hội viên cũ vẫn dùng được cho đến khi hết hạn, nhưng khách mới sẽ không thấy gói này để đăng ký.
        </div>
      </div>
    </div>
  );
}