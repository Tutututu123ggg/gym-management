"use client";
import React from 'react';
import { format } from 'date-fns';
import { 
  Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line 
} from 'recharts';
import { BodyMetric } from '@/types/customer/progress';
import { Activity } from 'lucide-react';

interface MetricsSectionProps {
  metrics: BodyMetric[];
  onOpenModal: () => void;
}

export default function MetricsSection({ metrics, onOpenModal }: MetricsSectionProps) {
  const latestMetric = metrics.length > 0 ? metrics[metrics.length - 1] : null;

  const chartData = metrics.map(m => ({
    ...m,
    displayDate: format(new Date(m.recordedAt), 'dd/MM'),
  }));

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-full min-h-[350px]">
       <div className="flex justify-between items-center mb-4 shrink-0">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
             <Activity size={16} className="text-pink-500"/> Chỉ số cơ thể
          </h3>
          <button 
             onClick={onOpenModal} 
             className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline flex items-center gap-1 transition-colors"
          >
             + Cập nhật
          </button>
       </div>

       {/* QUAN TRỌNG: Wrapper div phải có height cụ thể (flex-1) */}
       <div className="flex-1 w-full min-h-[200px] text-[10px]">
          {metrics.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                   <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                   <XAxis 
                      dataKey="displayDate" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      dy={10}
                   />
                   <YAxis yAxisId="left" domain={['dataMin - 2', 'dataMax + 2']} hide />
                   <YAxis yAxisId="right" orientation="right" domain={['dataMin - 1', 'dataMax + 1']} hide />
                   
                   <Tooltip 
                      labelFormatter={(label, payload) => {
                          if (payload && payload.length > 0) {
                              return format(new Date(payload[0].payload.recordedAt), 'dd/MM/yyyy');
                          }
                          return label;
                      }}
                      contentStyle={{ 
                         backgroundColor: '#fff', 
                         borderRadius: '12px', 
                         border: '1px solid #e2e8f0',
                         boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                         fontSize: '12px',
                         color: '#333'
                      }} 
                   />
                   <Area 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="weight" 
                      name="Cân nặng" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      fill="url(#colorWeight)" 
                   />
                   <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="bmi" 
                      name="BMI" 
                      stroke="#f97316" 
                      strokeWidth={2} 
                      dot={{ r: 3, fill: '#f97316', strokeWidth: 0 }}
                   />
                </ComposedChart>
             </ResponsiveContainer>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Activity size={32} strokeWidth={1.5} className="opacity-50"/>
                <p>Chưa có dữ liệu BMI</p>
             </div>
          )}
       </div>

       {/* Footer Stats */}
       {latestMetric && (
          <div className="flex justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
             <div>
                <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Cân nặng</span>
                <div className="font-black text-lg text-slate-800 dark:text-white mt-0.5">
                   {latestMetric.weight} <span className="text-xs font-normal text-slate-400">kg</span>
                </div>
             </div>
             <div className="text-right">
                <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">BMI</span>
                <div className={`font-black text-lg mt-0.5 ${latestMetric.bmi > 25 ? 'text-orange-500' : (latestMetric.bmi < 18.5 ? 'text-yellow-500' : 'text-green-500')}`}>
                   {latestMetric.bmi}
                </div>
             </div>
          </div>
       )}
    </div>
  );
}