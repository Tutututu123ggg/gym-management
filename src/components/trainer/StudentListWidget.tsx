"use client";

import { User, Phone, TrendingUp, ChevronLeft } from "lucide-react";

interface StudentListWidgetProps {
  courseName: string;
  students: any[];
  onBack: () => void;
  onSelectStudent: (student: any) => void;
}

export const StudentListWidget = ({ courseName, students, onBack, onSelectStudent }: StudentListWidgetProps) => {
  return (
    <div className="space-y-6">
      {/* Header nhỏ cho phần danh sách học viên */}
      <div className="flex items-center gap-2 pb-4 border-b border-border">
        <button 
          onClick={onBack} 
          className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">{courseName}</h2>
          <p className="text-sm text-muted-foreground">Danh sách học viên đã tham gia lớp này.</p>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-muted/10">
          <p className="text-muted-foreground">Chưa có học viên nào book lịch lớp này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => {
            const lastMetric = student.bodyMetrics?.[0];
            return (
              <div
                key={student.id}
                onClick={() => onSelectStudent(student)}
                // STYLE: Card giống dashboard
                className="group bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/50 cursor-pointer transition-all duration-200"
              >
                {/* Avatar & Name */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden">
                    {student.avatar ? (
                      <img src={student.avatar} alt="avt" className="w-full h-full object-cover" />
                    ) : (
                      <User className="text-muted-foreground" size={20} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-card-foreground group-hover:text-primary transition-colors">
                      {student.name || "Học viên ẩn danh"}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone size={10} /> {student.phone || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Metrics Mini Dashboard */}
                <div className="bg-muted/40 rounded-xl p-3 grid grid-cols-2 gap-4 text-sm border border-border/50">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Cân nặng</p>
                    <p className="font-semibold text-foreground text-base">
                      {lastMetric ? `${lastMetric.weight} kg` : "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">BMI</p>
                    <p className="font-semibold text-foreground text-base">
                      {lastMetric ? lastMetric.bmi.toFixed(1) : "--"}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-4 flex items-center justify-between text-xs font-medium">
                  <span className="text-muted-foreground">
                    Tham gia <span className="text-foreground">{student._count.bookings}</span> buổi
                  </span>
                  <span className="flex items-center gap-1 text-primary group-hover:underline">
                    Xem biểu đồ <TrendingUp size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};