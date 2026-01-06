"use client";

import { Loader2, X, Activity } from "lucide-react";
import { Line } from 'react-chartjs-2';
// Nhớ register ChartJS ở file này hoặc file cha
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  data: any[];
  loading: boolean;
}

export const ProgressModal = ({ isOpen, onClose, student, data, loading }: ProgressModalProps) => {
  if (!isOpen || !student) return null;

  // Cấu hình biểu đồ
  const chartData = {
    labels: data.map((d) => new Date(d.recordedAt).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'})),
    datasets: [
      {
        label: 'Cân nặng (kg)',
        data: data.map((d) => d.weight),
        borderColor: 'rgb(59, 130, 246)', // Blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        label: 'BMI',
        data: data.map((d) => d.bmi),
        borderColor: 'rgb(249, 115, 22)', // Orange-500
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.3,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    scales: {
      y: { type: 'linear' as const, display: true, position: 'left' as const, title: { display: true, text: 'Kg' } },
      y1: { type: 'linear' as const, display: true, position: 'right' as const, grid: { drawOnChartArea: false }, title: { display: true, text: 'BMI' } },
    },
    plugins: {
        legend: { labels: { color: 'gray' } } // Chỉnh màu text legend nếu cần
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-4xl rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh] zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-border flex justify-between items-center bg-muted/30">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              Tiến độ tập luyện
              <span className="text-sm font-normal text-muted-foreground bg-background px-2 py-1 rounded-md border border-border">
                {student.name}
              </span>
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors text-muted-foreground"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-card flex-1 min-h-[300px]">
          {loading ? (
             <div className="flex flex-col items-center justify-center h-full gap-2">
                <Loader2 className="animate-spin text-primary" size={40} />
                <span className="text-muted-foreground text-sm">Đang tải dữ liệu...</span>
             </div>
          ) : data.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
               <Activity size={64} className="mb-4 opacity-20" />
               <p>Học viên này chưa có dữ liệu đo chỉ số cơ thể nào.</p>
             </div>
          ) : (
             <div className="w-full h-[400px]">
                <Line data={chartData} options={chartOptions} />
             </div>
          )}
        </div>
        
      </div>
    </div>
  );
};