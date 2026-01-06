import React from 'react';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';
import { QrCode, LogOut, ScanLine } from 'lucide-react';

export default function CheckInCard({ isCheckedIn, session, onToggle, currentTime }: any) {
  const getDuration = () => {
    if (!session) return "00:00";
    const start = session.checkInAt;
    return `${differenceInHours(currentTime, start)}h ${differenceInMinutes(currentTime, start) % 60}m`;
  };

  const handleClick = () => {
    if (confirm(isCheckedIn ? "Kết thúc ca?" : "Vào ca?")) onToggle();
  };

  return (
    <div className={`rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-colors duration-500 ${isCheckedIn ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
       <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          <div className="bg-white p-2 rounded-xl shadow-inner">
             <QrCode size={48} className="text-slate-800"/>
          </div>
          <div className="flex-1 text-center sm:text-left">
             <h2 className="text-lg font-bold mb-1 flex items-center gap-2 justify-center sm:justify-start">
                {isCheckedIn ? <><LogOut size={20}/> Đang làm việc</> : <><ScanLine size={20}/> Check-in</>}
             </h2>
             {isCheckedIn ? (
               <div className="text-sm font-medium space-y-1">
                  <p>Bắt đầu: {format(session.checkInAt, 'HH:mm')}</p>
                  <p>Thời gian: {getDuration()}</p>
                  <button onClick={handleClick} className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold shadow">Check-out</button>
               </div>
             ) : (
               <button onClick={handleClick} className="mt-2 px-6 py-2 bg-white text-blue-700 font-bold rounded-lg shadow">Bắt đầu phiên</button>
             )}
          </div>
       </div>
    </div>
  );
}